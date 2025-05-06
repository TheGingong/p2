//import { availabilityGrid, checkAvailability, insertBookings } from "./availabilityMatrix";
import { globalState, roomsIndexToResourceId } from "../utils/globalVariables.js";
import { calculatePrefScore } from "../utils/prefScores.js";

let ghostMatrixTwo = [
    ["e7", "s1", "1", "e1"],
    ["s5", "5", "5", "e5"],
    ["s9", "9", "e9", "0"],
    ["0", "0", "s12", "e12"],
    ["s16", "e16", "s18", "e18"],
    ["s13", "13", "13e", "0"],
    ["10", "10", "10", "e10"],
    ["0","0","0","0"],
    ["71","71","71","71"]
  ];

let visibleBookings = [
    {
      "checkInDate": "2025-02-19",
      "checkOutDate": "2025-02-28",
      "guestsNumber": 4,
      "stayDuration": 13,
      "dayOfBooking": "2025-01-10",
      "resourceIds": "103",
      "bookingId": "s5",
      "preference": {
        "beds": "s0q2",
        "view": "seaview"
      }
    },
    {
      "checkInDate": "2025-02-17",
      "checkOutDate": "2025-03-02",
      "guestsNumber": 1,
      "stayDuration": 13,
      "dayOfBooking": "2025-01-19",
      "resourceIds": "105",
      "bookingId": "s9",
      "preference": {
        "beds": "s1q0"
      }
    },
    {
      "checkInDate": "2025-02-26",
      "checkOutDate": "2025-03-15",
      "guestsNumber": 2,
      "stayDuration": 15,
      "dayOfBooking": "2025-01-23",
      "resourceIds": "101",
      "bookingId": "s16",
      "preference": {
        "beds": "s0q1"
      }
    },
    {
      "checkInDate": "2025-03-22",
      "checkOutDate": "2025-04-07",
      "guestsNumber": 3,
      "stayDuration": 16,
      "dayOfBooking": "2025-02-04",
      "resourceIds": "104",
      "bookingId": "s13",
      "preference": {
        "beds": "s1q1"
      }
  }
  ]

preferenceOptimization(visibleBookings, null)

// Main optimzation function, which will call on subfunctions to optimize hotel bookings according to certain variables
function preferenceOptimization(visibleBookings, leniency) {  
    // Create the ghost matrix consisting of the new bookings from occupancy and the empty spots
    //initGhostMatrix();

    // Finds bookings starting today and placing them in an array
    let bookingsStartingToday = findWholeBooking(ghostMatrixTwo, visibleBookings);
    
    // Initializations
    let bookingPrefScore = 0;
    let prefScoreTable = [];
    let bestMatch = 0;
    
    // Iterate through the bookings in the bookings starting today array
    for (let booking of bookingsStartingToday) {
        for (let room = 0; room < ghostMatrixTwo.length; room++) {
            if (validSwaps(booking.bookingId, room, ghostMatrixTwo)) {
                bookingPrefScore = calculatePrefScore(booking, room);

                // Ensure the room index in prefScoreTable is initialized
                if (!prefScoreTable[room]) {
                    prefScoreTable[room] = [];
                }

                // Push the preference score at the right room index to the booking that will get that specific score at that location
                prefScoreTable[room].push([booking.id, bookingPrefScore])
                
                // Delete this
                console.log(`Booking ${booking.bookingId} can be swapped into room ${room}`);

                // Find the location/resourceId of where the booking it wants to swap with is located - get this from pinu
                
            }
        }
    }
    // Find the right prioritization of the bookings starting today array
    prioritySwaps(bookingsStartingToday);
        // For loop that iterates over the sortedBookings to find the best matches and assigning resourceIds
        for (booking of sortedBookings) {
            bestMatch = locateBestMatches(booking.id, prefScoreTable);
            assignResourceIds(booking, bestMatch) // bestMatch needs to be converted to resourceId
        }
        // Do the swap - need from pinu
}

//const ghostMatrix = initGhostMatrix(visibleBookings);

// Function that inserts the visible bookings for today into a pliable 'ghost' matrix
function initGhostMatrix(visibleBookings) {
    let tempMatrix = availabilityGrid;
    insertBookings(visibleBookings, tempMatrix);
    console.log(tempMatrix);
    return tempMatrix;
}

// Function that evaluates bookings, and returns a true or a false of possible/valid swaps for a single input booking 
function validSwaps(bookingId, room, matrix) {
    let bookingDuration = 3;
    if (matrix[room][0].includes("s") || matrix[room][0] === "0") { 
        if (matrix[room][bookingDuration].includes("e") || matrix[room][bookingDuration] === "0") {
            // This is now a possible swap for this booking so return true
            return true;
        }
    }
    return false;
}

// Helper function to validSwaps
function findWholeBooking(ghostMatrix, visibleBookings) {
    const bookingMap = {};
    for (const booking of visibleBookings) {
        bookingMap[booking.bookingId] = booking;
    }

    const bookingsStartingToday = [];
  
    for (let row = 0; row < ghostMatrix.length; row++) {
        if (ghostMatrix[row][0].includes("s")) {
            bookingsStartingToday.push(ghostMatrix[row][0]);
        }
    }

    const fullBookings = bookingsStartingToday.map(id => bookingMap[id]).filter(Boolean);
    console.log(fullBookings);

    // Returns the bookings starting today
    return fullBookings;
}

// Prioritizes the bookings starting today, s.t. first booking is the booking we earn the most score from (least prefs)
function prioritySwaps(booksStarting2day) {
    // Sorts the bookgins starting today, with the following arrow-function
    booksStarting2day.sort((booking1,booking2) => {
        // If the two bookings are not of the same stayduration, sort them longest to shortest
        if (booking1.stayDuration !== booking2.stayDuration){
            return booking2.stayDuration - booking1.stayDuration
        }
        // Else, we sort them based on how many preferences the bookings have.
        // Bookings with the least prefs come first (as a single pref carries more weight for these) 
        // followed by bookings with more preferences
        return Object.keys(booking1.preference).length - Object.keys(booking2.preference).length;
    })
    return booksStarting2day;
}

function locateBestMatches(booking, prefScoreTable) {
    // Iterate through the elements and find the spot where the preference score is highest for the booking
    let currentBest = -Infinity;
    let currentBestIndex = 0;
    let counter = 0;
    
    for (let outerArray of prefScoreTable) {
        for (let pair of outerArray) {
            if (pair[0] === booking && pair[1] > currentBest) {
                // Element was found in the table, and the value is larger, so update current best
                currentBest = pair[1];
                currentBestIndex = counter;
            } else {
                console.error("Booking was not found in the array");            
            }
        }
        counter++;
    }

    // Set all other pairs at this location to null, so the room wont be assigned twice or more.
    prefScoreTable[currentBestIndex] = [];

    return currentBestIndex;
}

function assignResourceIds(booking, bestMatchFound) {
    const roomDetails = roomsIndexToResourceId[bestMatchFound];
    
    // Find booking in visible bookings and visiblebooking[i] = booking


    // Update bookings resource id with the id at the correct index
    let tempId = booking.resourceIds; // use this temp value to update the other bookings
    booking.resourceIds = roomDetails.roomNumber;
    
    const VBHashMap = roomsInfoo.reduce((hash, booking) => {
        hash[booking.resourceIds] = booking;
        return hash;
    }, {});
    
    // Look through visible bookings to update the bookings with the one you want to swap with

    // Change the resource ids in visible bookings and return the new updated visible bookings array that will be allocated
}