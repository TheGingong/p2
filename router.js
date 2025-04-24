export {ValidationError, NoResourceError, processReq};
import {extractJSON, fileResponse, htmlResponse,extractForm,jsonResponse,errorResponse,reportError,startServer} from "./server.js";
import { extendGrid, insertBookings, checkAvailability, availabilityGrid } from "./src/scripts/availabilityMatrix.js";
import { roomsInfo, bookingsInfo, loadRooms } from "./src/utils/getInfo.js"
import { generateRooms, generateRoomNumber, generateGuests } from "./src/scripts/roomGenerator.js";
import { storeBatch365 } from "./src/utils/impartial.js";
import { scoring } from "./src/utils/prefScores.js";
import { json } from "stream/consumers";
import { easyalg } from "./src/utils/DaveTest.js";
import { getVisibleBookings } from "./src/scripts/assignBookings.js";
import {globalState } from "./src/utils/globalVariables.js";
import dayjs from "dayjs";

const ValidationError="Validation Error";
const NoResourceError="No Such Resource";

// Delete soon
let testarray = [
  {
    startDate: '2025-03-11',
    endDate: '2025-03-27',
    resourceIds: '101',
    preferences: [ 'Possible preferences' ],
    stayDuration: 4
  },
  {
    startDate: '2025-03-19',
    endDate: '2025-03-22',
    resourceIds: '102',
    preferences: [ 'Possible preferences' ],
    stayDuration: 3
  }] 

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
          case "batch365":
            storeBatch365()
            .then((result) => {
              jsonResponse(res, result);
            })
            .catch((err) => {
              reportError(res, new Error(err));          
            })
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
          case "allocate":
          try {
            await allocate(res)


          } catch (error) {
              console.error("Error in allocate case:", error);
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


async function allocate(res){
    let lastArray = []
    let allocationArray = []
    let assignedBookings = []

    for (let i = 0; i < 365; i++){
    allocationArray = await getVisibleBookings(bookingsInfo, globalState.currentDay)
    assignedBookings = await easyalg(allocationArray)

    globalState.currentDay = dayjs(globalState.currentDay).add(1, 'day').format('YYYY-MM-DD'); 
    console.log("currentDay" + globalState.currentDay)
    lastArray.push(...assignedBookings);
    }   
    //scoring(bookingsInfo, roomsInfo); // Perform scoring

    //await jsonResponse(res, lastArray ); // Send the response
    console.log("lastArray")
    console.log(lastArray)
    await jsonResponse(res, lastArray ); // Send the response
}