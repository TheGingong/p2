export {ValidationError, NoResourceError, processReq};
import {extractJSON, fileResponse, htmlResponse,extractForm,jsonResponse,errorResponse,reportError,startServer} from "./server.js";
import { extendGrid, insertBookings, checkAvailability, availabilityGrid, resetMatrix } from "./src/scripts/availabilityMatrix.js";
import { roomsInfo, bookingsInfo, loadRooms } from "./src/utils/getInfo.js"
import { generateRooms, generateRoomNumber, generateGuests } from "./src/scripts/roomGenerator.js";
import { storeBookings } from "./src/utils/impartial.js";
import { calculatePrefScore } from "./src/utils/prefScores.js";
import { json } from "stream/consumers";
import { getVisibleBookings, matchBookingsToRooms} from "./src/scripts/assignBookings.js";
import {globalState } from "./src/utils/globalVariables.js";
import dayjs from "dayjs";

const ValidationError="Validation Error";
const NoResourceError="No Such Resource";

let startValue = 0;

startServer();
/* *********************************************************************
   Setup HTTP route handling: Called when a HTTP request is received 
   ******************************************************************** */
   
   // Fills the rooms! 
   generateRooms();

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
            resetMatrix();
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
    let succesfulBookings = []
    let allocationArray = []
    let assignedBookings = []
    let notAssignedBookings = []
    let failedBookings = []
    days += startValue

    for (let i = startValue; i < days; i++){
    //allocationArray = await getVisibleBookings(bookingsInfo, globalState.currentDay)
      [assignedBookings,notAssignedBookings]= await matchBookingsToRooms(version) || []; // sort by StayDuration, checkInDay or Random

      
      // KALD PREFSCORE ALGORITHM MED assignedBookings som parameter

      // Call our algorithm function
      // Final array gets defined

      globalState.currentDay = dayjs(globalState.currentDay).add(1, 'day').format('YYYY-MM-DD'); 
      console.log("CurrentDay = " + globalState.currentDay)
      succesfulBookings.push(...assignedBookings); // Push our array of succesful bookings we made in algorithm
      failedBookings.push(...notAssignedBookings); // Push our array of failed bookings from algorithm into failedBookings
    }   
    startValue = days

    //scoring(bookingsInfo, roomsInfo); // Perform scoring

    //await jsonResponse(res, lastArray ); // Send the response
    console.log("Succesful bookings: ")
    console.log(succesfulBookings)
    console.log("Assigned bookings: ", succesfulBookings.length)
    console.log("Failed bookings: ", failedBookings.length)
    
    jsonResponse(res, succesfulBookings ); // Send the response
}