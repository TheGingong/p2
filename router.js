export {ValidationError, NoResourceError, processReq};
import {extractJSON, fileResponse, htmlResponse,extractForm,jsonResponse,errorResponse,reportError,startServer} from "./server.js";
import {allocate} from "./public/js/allocation.js"
import { roomsInfo, bookingsInfo, loadBookings } from "./src/utils/getInfo.js"
import { storeBatch } from "./src/utils/impartial.js";
import { extendGrid, insertBookings, checkAvailability, loopAvailability } from "./src/scripts/availabilityMatrix.js";

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
   function processReq(req,res){
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
          case "batch":
            storeBatch()
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
             loadBookings()
             .then(() => {
                 console.log("Rooms and Bookings loaded successfully.");
             })
             .catch((err) => {
                 console.error("Error loading Rooms and Bookings:", err);
              });
             fileResponse(res,"/html/index.html");
             break;
          case "allocate":
            loadBookings()
            .then(() => {
              insertBookings(bookingsInfo)
              jsonResponse(res, bookingsInfo);
           
                    })
            .catch((err) => {
              console.error("Error loading bookings:", err);
              reportError(res, new Error("Failed to load bookings."));
          });

            break;
          case "rooms":
            if (roomsInfo) {
                extendGrid
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