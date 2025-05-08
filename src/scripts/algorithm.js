/**
 * This file contains the functions, that will perform most of the operations required for our optimization of hotel bookings. 
 * Comparisons and swaps are made, as well as defining the necessary subfunctions. 
 */

//import { availabilityGrid, checkAvailability, insertBookings } from "./availabilityMatrix";
import { globalState, roomsIndexToResourceId } from "../utils/globalVariables.js";
import { calculatePrefScore } from "../utils/prefScores.js";
import { Matrix } from "../utils/matrixFile.js"

// Temp, hardcoded, usable variables
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

// Function call - will be moved to router
preferenceOptimization(visibleBookings, null);

/**
 * Main optimzation function, which will call on subfunctions to optimize hotel bookings according to certain variables.
 */
function preferenceOptimization(visibleBookings, ghostMatrix, leniency) {  
    // Create the ghost matrix consisting of the new bookings from occupancy and the empty spots
    //initGhostMatrix();
    // Delete? !!

    // Finds bookings starting today and places them in an array.
    let bookingsStartingToday = findBookingsStartingToday(ghostMatrixTwo, visibleBookings);
    let bookingPrefScore = 0;
    let prefScoreTable = [];
    let bestSwapMatch = 0;
    
    // Iterate through the bookings in the bookings starting today array.
    for (const booking of bookingsStartingToday) {
        for (const room = 0; room < ghostMatrixTwo.length; room++) {
            if (validSwaps(booking, room, ghostMatrixTwo)) {
                bookingPrefScore = calculatePrefScore(booking, room);

                // Ensure the room index in prefScoreTable is initialized.
                if (!prefScoreTable[room]) {
                    prefScoreTable[room] = [];
                }

                // Push the preference score at the right room index, to the booking that will get that specific score at that location.
                prefScoreTable[room].push([booking.id, bookingPrefScore]);
                
                // Delete this !!
                console.log(`Booking ${booking.bookingId} can be swapped into room ${room}`);

                // Find the location/resourceId of where the booking it wants to swap with is located - get this from pinu - WIP
                
            }
        }
    }
    
    // Find the right prioritization of the bookings starting today array.
    let sortedBookings = prioritySwaps(bookingsStartingToday);

    // For loop that iterates over the sortedBookings to find the best matches and assigning resourceIds.
    for (booking of sortedBookings) {
        bestSwapMatch = locateBestMatches(booking.id, prefScoreTable);
        assignResourceIds(booking, bestSwapMatch, bookingsStartingToday);
    }
    return bookingsStartingToday; // This will be used to update the fullCalendar
}

/**
 * Function that inserts the visible bookings for today into a pliable 'ghost' matrix.
 */
function initGhostMatrix(visibleBookings) {
    let tempMatrix = availabilityGrid;
    insertBookings(visibleBookings, tempMatrix);
    console.log(tempMatrix);
    return tempMatrix;
}

/**
 * Helper function to validSwaps. This function will find all the bookings starting today, 
 * and return them in their object form using a hash function, so that we may access all their information. 
 */ 
function findBookingsStartingToday(ghostMatrix, visibleBookings) {
    const bookingMap = {};
    
    for (const booking of visibleBookings) {
        bookingMap[booking.bookingId] = booking;
    }

    const bookingsStartingToday = [];
  
    for (let row = 0; row < ghostMatrix.length; row++) {
        if (ghostMatrix[row][0].includes("s")) {
            bookingsStartingToday.push(ghostMatrix[row][0].replace('/s/',''));
        }
    }

    const fullBookings = bookingsStartingToday.map(id => bookingMap[id]).filter(Boolean);
    console.log(fullBookings);

    // fullBookings array contains all the bookings starting today, represented as full booking objects.
    return fullBookings;
}

/**
 * Function that evaluates bookings, and returns a true or a false of possible/valid swaps for a single input booking.
 */
function validSwaps(booking, room, matrix) {
    let bookingDuration = booking.stayDuration;
    if (matrix[room][0].includes("s") || matrix[room][0] === "0") { 
        if (matrix[room][bookingDuration].includes("e") || matrix[room][bookingDuration] === "0") {
            // This is now a possible swap for this booking so return true.
            return true;
        }
    }
    return false;
}

/**
 * Prioritizes the bookings starting today, s.t. first booking is the booking we earn the most score from (least prefs).
 */
function prioritySwaps(booksStarting2day) {
    // Creates a copy of the array so it doesn't directly change the bookingsStartingToday array, as we need this later in the swap.
    let sortedArray = [...booksStarting2day];
    
    // Sorts the bookgins starting today, with the following arrow-function.
    sortedArray.sort((booking1, booking2) => {
        // If the two bookings are not of the same stayduration, sort them longest to shortest.
        if (booking1.stayDuration !== booking2.stayDuration){
            return booking2.stayDuration - booking1.stayDuration
        }
        // Else, we sort them based on how many preferences the bookings have.
        // Bookings with the least prefs come first (as a single pref carries more weight for these) 
        // followed by bookings with more preferences.
        return Object.keys(booking1.preference).length - Object.keys(booking2.preference).length;
    })
    return sortedArray;
}

/**
 * Funtion that searches and finds the best room matching a booking's preferences.
 */ 
function locateBestMatches(booking, prefScoreTable) {
    let currentBest = -Infinity;
    let currentBestIndex = 0;
    let counter = 0;
    
    // Iterates through the elements and find the spot where the preference score is highest for the booking.
    for (let outerArray of prefScoreTable) {
        for (let pair of outerArray) {
            if (pair[0] === booking && pair[1] > currentBest) {
                // If the element was found in the table, and the value is larger, update current best. 
                currentBest = pair[1];
                currentBestIndex = counter;
            } else {
                console.error("Booking was not found in the array");            
            }
        }
        counter++;
    }
    // Set all other pairs at this location to an empty array, so the room wont be assigned twice or more.
    prefScoreTable[currentBestIndex] = [];

    return currentBestIndex;
}

/**
 * WIP
 */
function assignResourceIds(booking, bestMatchFound, bookingsStartingToday) {
    // Ensure the room is found - Error handling
    if (!roomsIndexToResourceId[bestMatchFound]) {
        console.error(`Invalid index: ${bestMatchFound}`);
        return;
    }
    
    // Give an index and return the room object corresponding to that index. Check if this is the right index out of ghostmatrix.
    const roomDetails = roomsIndexToResourceId[bestMatchFound];

    // Ensure the booking to swap with exists - Error handling
    if (!bookingsStartingToday[bestMatchFound]) {
        console.error(`No booking found at index: ${bestMatchFound}`);
        return;
    }

    // Find the correct booking to swap with, we know the index is pointing to the correct booking because the prefScoreTable was created out of bookingsStartingToday
    const bookingToSwapWith = bookingsStartingToday[bestMatchFound];
    
    /* Swap logic below */
    // Swap the resource ids around
    const tempResourceId = booking.resourceIds;
    booking.resourceIds = roomDetails.roomNumber;
    bookingToSwapWith.resourceIds = tempResourceId;

    // For loop to find the correct position of the booking we want to swap
    // Swap the bookings around in the bookingStartingToday array so the array will correctly reflect the change
    for (let i in bookingsStartingToday) {
        if (booking.id === bookingsStartingToday[i].bookingId) {
            bookingsStartingToday[i] = bookingToSwapWith;
            bookingsStartingToday[bestMatchFound] = booking;
        }
    }
}