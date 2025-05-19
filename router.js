/**
 * router.js – Routes HTTP requests for the booking system.
 *
 * Includes:
 * - Static file serving.
 * - Booking generation and reset.
 * - Room allocation using different strategies.
 * - Room data retrieval.
 */
import { extractJSON, fileResponse, htmlResponse, extractForm, jsonResponse, errorResponse, reportError, startServer } from "./server.js";
import { availabilityGrid, clearMatrix } from "./src/scripts/availabilityMatrix.js";
import { roomsInfo, loadRooms } from "./src/utils/getInfo.js"
import { storeBookings } from "./src/utils/impartial.js";
import { prefScoreArray } from "./src/utils/prefScores.js";
import { matchBookingsToRooms} from "./src/scripts/assignBookings.js";
import { globalState } from "./src/utils/globalVariables.js";
import { preferenceOptimization } from "./src/scripts/algorithm.js";
import { countZeroes, wastedSpaceEvaluate } from "./src/utils/wastedSpaceScore.js";
import dayjs from "dayjs";
export { ValidationError, NoResourceError, processReq };

const ValidationError = "Validation Error";
const NoResourceError = "No Such Resource";
let startValue = 0; // To be used later in allocate().

startServer();
/* *********************************************************************
Setup HTTP route handling: Called when a HTTP request is received.
******************************************************************** */

// Uncomment this below to fills the rooms - if need be! 
//generateRooms();

/**
 * Handles incoming HTTP requests and routes them based on method and URL.
 *
 * @param {http.IncomingMessage} req The incoming HTTP request object.
 * @param {http.ServerResponse} res The outgoing HTTP response object.
 */
async function processReq(req, res) {
  console.log("GOT: " + req.method + " " + req.url);

  let baseURL = 'https://' + req.headers.host + '/'; // https://github.com/nodejs/node/issues/12682
  let url = new URL(req.url, baseURL);
  let searchParms = new URLSearchParams(url.search);
  let queryPath = decodeURIComponent(url.pathname); // Convert uri encoded special letters (eg æøå that is escaped by "%number") to JS string.

  /**
   * Switch case to handle the HTTP requests from fetches and so on. Handles POST and GET requests.
   */
  switch(req.method) {
    case "POST": {
      let pathElements = queryPath.split("/"); 
      console.log(pathElements[1]);
      switch(pathElements[1]) {
        // POST endpoint for the generation of batches.
        case "generateBookings":
          const amountOfBookingsParam = searchParms.get("amountOfBookings"); // Get the number of bookings from the query parameter.
          const amountOfBookings = parseInt(amountOfBookingsParam, 10);
          // Calls storeBookings in impartial.js to generate the bookings.
          storeBookings(amountOfBookings)
          .then((result) => {
            jsonResponse(res, result);
          })
          .catch((err) => {
            reportError(res, new Error(err));          
          })
          break;
        // POST endoint for clearing the matrix entries.
        case "reset":
          clearMatrix();
          startValue = 0;
          globalState.reset();
          jsonResponse(res, "Matrix was succesfully reset.");
          break;
        default: 
          console.error("Resource doesn't exist.");
          reportError(res, new Error(NoResourceError)); 
      }
    } 
    break; //END OF POST ENDPOINTS.
    case "GET": {
      let pathElements = queryPath.split("/"); 
      console.log(pathElements);
      // USE "searchParms" from above to get query search parameters.
      switch(pathElements[1]){     
        // GET endpoint for loading the home page.
        case "": // "/"
            loadRooms()
            .then(() => {
                console.log("Rooms loaded successfully.");
            })
            .catch((err) => {
                console.error("Error loading Rooms and Bookings:", err);
            });
            fileResponse(res, "/html/index.html");
            break;
        // GET endpoint for allocation request (blue algorithm button press) - sorted by duration and bestFit algorithm.
        case "leastDiff":
          try {
            const daysParam = searchParms.get("days"); // Get the number of days from the query parameter
            const days = parseInt(daysParam, 10);
            await allocate(res, days, 0);
        } catch (error) {
            console.error("Error in best fit case:", error);
            reportError(res, error);
        }
        break;
        // GET endpoint for allocation request (orange algorithm button press) - sorting by duration only
        case "stayDuration":
          try {
            const daysParam = searchParms.get("days");
            const days = parseInt(daysParam, 10);
            await allocate(res, days, 1);
        } catch (error) {
            console.error("Error in sort by duration case:", error);
            reportError(res, error);
        }
        break;
        // GET endpoint for random allocation request - no sorting.
        case "random":
          try {
            const daysParam = searchParms.get("days");
            const days = parseInt(daysParam, 10);
            await allocate(res, days, 2);
        } catch (error) {
            console.error("Error in randomAllocate case:", error);
            reportError(res, error);
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
        case "evaluation":
          jsonResponse(res, {
            avgPreference: prefScoreArray.length
              ? prefScoreArray.reduce((a, b) => a + b, 0) / prefScoreArray.length
              : 0,
            assigned: globalState.totalAssigned || 0,
            failed: globalState.totalFailed || 0,
            zeroCells: Object.values(availabilityGrid).reduce((acc, row) => {
              return acc + row.reduce((rowAcc, cell) => rowAcc + (cell === 0 ? 1 : 0), 0);
            }, 0),
            wastedScore: globalState.lastWastedScore || 0,
          });
          break;
        default: // For anything else we assume it is a file to be served.
          fileResponse(res, req.url);
        break;
      }
    }
    break; // END OF GET ENDPOINTS.
    default:
      reportError(res, new Error(NoResourceError)); // Report an error if one happens throughtout the switch.
  }
}

/**
 * Allocates bookings to rooms over a number of days using a selected strategy.
 *
 * @param {http.ServerResponse} res – The response object to send back results.
 * @param {number} days – Number of days to run the allocation process.
 * @param {number} version – Allocation strategy to use:
 *                            0 = sort by stay duration,
 *                            1 = sort by stay duratio and bestfit algorithm,
 *                            2 = random allocation.
 */
async function allocate(res, days, version) {
    let allocationArray = []; // Final array of bookings for response.
    let assignedBookingsResults = {};
    let totalPrefScore = 0;
    let notAssignedBookings = []
    prefScoreArray.length = 0; // Reset preference score tracking.

    // Number of days to simulate. We start from start value and count until days, which is current day + x days.
    days += startValue;

    // Loop through each day and allocate bookings.
    for (let i = startValue; i < days; i++) {
      // Match bookings to rooms using chosen version/strategy.
      assignedBookingsResults = await matchBookingsToRooms(version) || [];
      
      // Push our array of failed bookings we made in algorithm.
      notAssignedBookings.push(...assignedBookingsResults.discardedBookings) 

      if (version !== 2) {
        // Apply preference optimization for sorted strategies
        let results = await preferenceOptimization(assignedBookingsResults.visibleBookings, totalPrefScore) || [];
        totalPrefScore = results.totalPrefScore;  // Update the accumulated preference score.
        allocationArray.push(...results.bookingsStartingToday); // Push our array we made in algorithm to the array that will be allocated in fullCalendar.
        //console.log("Preferensce score for the current allocation", totalPrefScore);
      } else {
        totalPrefScore += assignedBookingsResults.totalRandomPrefScore; // Update the accumulated preference score for the RANDOM allocation algorithm.
        allocationArray.push(...assignedBookingsResults.finalArray); // Push our array we made in algorithm
        //console.log("Preferensce score for the random allocation (ver: " + version + ")", totalPrefScore);
      }
      
      // Updates the day
      globalState.currentDay = dayjs(globalState.currentDay).add(1, 'day').format('YYYY-MM-DD'); 
      console.log("Current day " + globalState.currentDay);

      globalState.totalAssigned = allocationArray.length;
      globalState.totalFailed = notAssignedBookings.length;
      globalState.lastWastedScore = wastedSpaceEvaluate(availabilityGrid); // assume it returns a score

    }   

    let sumOfPreferences = 0;

    // Iterates through the prefScoreArray after its been filled by prefScores.js, and print the average - with the purpose of evaluating.
    for (let i of prefScoreArray){
      sumOfPreferences += i;
    }

    console.log("Average preferences of the allocation (ver: " + version + ")");
    console.log(sumOfPreferences / prefScoreArray.length)
  
    // Console log both the amount of assigned and failed bookings.
    console.log("Assigned bookings: ", allocationArray.length)
    console.log("Failed bookings: ", notAssignedBookings.length)
    
    // New start value is the days we have counted up to.
    startValue = days;

    // Function call to calculate the wasted space score which counts consecutive zeros and countZeros which counts all zeroes in the matrix.
    wastedSpaceEvaluate(availabilityGrid); 
    countZeroes()
    jsonResponse(res, allocationArray); // Send the response
}