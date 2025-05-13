export {ValidationError, NoResourceError, processReq};
import {extractJSON, fileResponse, htmlResponse,extractForm,jsonResponse,errorResponse,reportError,startServer} from "./server.js";
import { extendGrid, insertBookings, checkAvailability, availabilityGrid, clearMatrix } from "./src/scripts/availabilityMatrix.js";
import { roomsInfo, bookingsInfo, loadRooms } from "./src/utils/getInfo.js"
import { generateRooms, generateRoomNumber, generateGuests } from "./src/scripts/roomGenerator.js";
import { storeBookings } from "./src/utils/impartial.js";
import { calculatePrefScore, prefScoreArray } from "./src/utils/prefScores.js";
import { json } from "stream/consumers";
import { getVisibleBookings, matchBookingsToRooms} from "./src/scripts/assignBookings.js";
import {globalState } from "./src/utils/globalVariables.js";
import { preferenceOptimization } from "./src/scripts/algorithm.js";
import dayjs from "dayjs";

const ValidationError="Validation Error";
const NoResourceError="No Such Resource";

let startValue = 0;

startServer();
/* *********************************************************************
   Setup HTTP route handling: Called when a HTTP request is received 
   ******************************************************************** */
   
   // Fills the rooms! 
   //await generateRooms();

   async function processReq(req,res){
    console.log("GOT: " + req.method + " " +req.url);
  
    let baseURL = 'https://' + req.headers.host + '/';    //https://github.com/nodejs/node/issues/12682
    let url=new URL(req.url,baseURL);
    let searchParms=new URLSearchParams(url.search);
    let queryPath=decodeURIComponent(url.pathname); //Convert uri encoded special letters (eg æøå that is escaped by "%number") to JS string

    switch(req.method){
      case "POST": {
        let pathElements=queryPath.split("/"); 
        console.log(pathElements[1]);
         switch(pathElements[1]){
          // ADD CASES FOR POST
          // Post endpoint for the generation of batches
          case "generateBookings":
            // Get the number of bookings from the query parameter
            const amountOfBookingsParam = searchParms.get("amountOfBookings");
            const amountOfBookings = parseInt(amountOfBookingsParam, 10);
            storeBookings(amountOfBookings)
            .then((result) => {
              jsonResponse(res, result);
            })
            .catch((err) => {
              reportError(res, new Error(err));          
            })
            break;
          case "reset":
            clearMatrix();
            startValue = 0;
            globalState.reset();
            jsonResponse(res, "matrix was succesfully reset");
            break;
          default: 
            console.error("Resource doesn't exist");
            reportError(res, new Error(NoResourceError)); 
          }
        } 
        break; //END POST URL
      case "GET":{
        let pathElements=queryPath.split("/"); 
        console.log(pathElements);
        //USE "sp" from above to get query search parameters
        switch(pathElements[1]){     
          case "": // "/"
             // Load bookings at startup - promisebased (can be used later as a database maybe?)
             loadRooms()
             .then(() => {
                 console.log("Rooms and Bookings loaded successfully.");
             })
             .catch((err) => {
                 console.error("Error loading Rooms and Bookings:", err);
              });
             fileResponse(res,"/html/index.html");
             break;
          case "allocate": // sortByDuration and bestfit
            try {
              // Get the number of days from the query parameter
              const daysParam = searchParms.get("days");
              const days = parseInt(daysParam, 10);
              await allocate(res, days, 0);
              //scoring(bookingsInfo, roomsInfo); // Perform scoring
              //console.log("score = " + wastedSpace(availabilityGrid, roomsInfo))
          } catch (error) {
              console.error("Error in allocate case:", error);
              reportError(res, error); // Send error response
          }
          break;
          case "allocate2": // sortByDuration only
            try {
              const daysParam = searchParms.get("days");
              const days = parseInt(daysParam, 10);
              await allocate(res, days, 1);
              //scoring(bookingsInfo, roomsInfo); // Perform scoring
              //console.log("score = " + wastedSpace(availabilityGrid, roomsInfo))
          } catch (error) {
              console.error("Error in allocate1 case:", error);
              reportError(res, error); // Send error response
          }
          break;
          case "random": // allocate without sorting
            try {
              const daysParam = searchParms.get("days");
              const days = parseInt(daysParam, 10);
              await allocate(res, days, 2);
              //scoring(bookingsInfo, roomsInfo); // Perform scoring
              //console.log("score = " + wastedSpace(availabilityGrid, roomsInfo))
          } catch (error) {
              console.error("Error in randomAllocate case:", error);
              reportError(res, error); // Send error response
          }
          break;
          case "rooms":
            if (roomsInfo) {
                jsonResponse(res, roomsInfo);
            } else {
                console.error("Rooms data is not loaded yet.");
                jsonResponse(res, { error: "Rooms data is not available." });
            }
            break;
          default: //for anything else we assume it is a file to be served
            fileResponse(res, req.url);
          break;
        }//path
      }//switch GET URL
      break;
      default:
       reportError(res, new Error(NoResourceError)); 
    } //end switch method
  }

async function allocate(res, days, version){
    let lastArray = [];
    let assignedBookingsResults = {};
    let totalPrefScore = 0;
    let totalRandomPrefScore = 0;
    prefScoreArray.length = 0; // Clears the array

    days += startValue;

    let successfulBookings = []
    let assignedBookings = []
    let notAssignedBookings = []
    let failedBookings = []

    for (let i = startValue; i < days; i++) {
      assignedBookingsResults = await matchBookingsToRooms(version) || []; // sort by StayDuration, checkInDay or Random




      if (version !== 2) {
        let results = await preferenceOptimization(assignedBookingsResults.visibleBookings, totalPrefScore, null) || [];
        totalPrefScore = results.totalPrefScore;  // Update the accumulated score
        lastArray.push(...results.bookingsStartingToday); // Push our array we made in algorithm
        console.log("Preferensce score for the current allocation", totalPrefScore);
      } else {
        totalPrefScore += assignedBookingsResults.totalRandomPrefScore;
        console.log("Preferensce score for the current allocation RANDOM", totalPrefScore);
        lastArray.push(...assignedBookingsResults.finalArray); // Push our array we made in algorithm
      }
      
      // Updates the day
      globalState.currentDay = dayjs(globalState.currentDay).add(1, 'day').format('YYYY-MM-DD'); 
      console.log("currentDay" + globalState.currentDay);
    
    }   

    let sum = 0;
    for (let i of prefScoreArray){
      sum += i;
    }
    console.log("average preferences")
    console.log(sum / prefScoreArray.length)
    startValue = days;

     successfulBookings.push(...assignedBookings); // Push our array of succesful bookings we made in algorithm
      failedBookings.push(...notAssignedBookings); // Push our array of failed bookings from algorithm into failedBookings
       

    console.log("Succesful bookings: ")
    console.log(successfulBookings)
    console.log("Assigned bookings: ", successfulBookings.length)
    console.log("Failed bookings: ", failedBookings.length)
    


    


    jsonResponse(res, lastArray ); // Send the response

}