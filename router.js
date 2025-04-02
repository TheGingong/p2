export {ValidationError, NoResourceError, processReq};
import {extractJSON, fileResponse, htmlResponse,extractForm,jsonResponse,errorResponse,reportError,startServer} from "./server.js";
import {allocate} from "./public/js/allocation.js"
import { Rooms, Bookings } from "./src/getInfo.js"
import { storeBatch } from "./src/utils/impartial.js";

const ValidationError="Validation Error";
const NoResourceError="No Such Resource";

// Delete soon
let testarray = [
  {
    startDate: '2025-03-11',
    endDate: '2025-03-27',
    resourceIds: 'a',
    preferences: [ 'Possible preferences' ],
    stayDuration: 4
  },
  {
    startDate: '2025-04-19',
    endDate: '2025-04-22',
    resourceIds: 'b',
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
             fileResponse(res,"/html/index.html");
             break;
          case "allocate":
            jsonResponse(res, testarray);
            break;
          case "rooms":
            if (Rooms) {
                jsonResponse(res, Rooms);
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