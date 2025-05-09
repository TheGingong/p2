/**
 * This file contains the functions, that will perform most of the operations required for our optimization of hotel bookings. 
 * Comparisons and swaps are made, as well as defining the necessary subfunctions. 
 */
import { globalState, roomsIndexToResourceId } from "../utils/globalVariables.js";
import { calculatePrefScore } from "../utils/prefScores.js";
import { dateIndex, availabilityGrid, insertBookings } from "./availabilityMatrix.js";
import { roomsInfo } from "../utils/getInfo.js";
export { preferenceOptimization }

/**
 * Main optimzation function, which will call on subfunctions to optimize hotel bookings according to certain variables.
 */
async function preferenceOptimization(visibleBookings, leniency) {
    let currentDay = dateIndex(globalState.currentDay);

    console.log("HERE IS THE VISIBLEBOOKINGS:");
    console.log(visibleBookings);

    let ghostMatrix = JSON.parse(JSON.stringify(availabilityGrid));

    let roomArray = [];

    for (let room of roomsInfo) {
        roomArray.push(room.roomNumber);
    }

    // Finds bookings starting today and places them in an array.
    let bookingsStartingToday = findBookingsStartingToday(ghostMatrix, visibleBookings, roomArray, currentDay);
    let bookingPrefScore = 0;
    let prefScoreTable = [];
    let bestSwapMatch = 0;
    
    // Iterate through the bookings in the bookings starting today array.
    for (let booking of bookingsStartingToday) {
        for (let i = 0; i < roomArray.length; i++) {
            if (validSwaps(booking, roomArray[i], ghostMatrix, currentDay)) {
                bookingPrefScore = await calculatePrefScore(booking, roomArray[i]);

                // Ensure the room index in prefScoreTable is initialized.
                if (!prefScoreTable[i]) {
                    prefScoreTable[i] = [];
                }

                // Push the preference score at the right room index, to the booking that will get that specific score at that location.
                console.log("Here is da bookingID")
                console.log(booking.bookingId);
                console.log(bookingPrefScore);
                prefScoreTable[i].push([booking.bookingId, bookingPrefScore]);
                                
            }
        }
    }
    
    // Find the right prioritization of the bookings starting today array.
    let sortedBookings = prioritySwaps(bookingsStartingToday);

    // For loop that iterates over the sortedBookings to find the best matches and assigning resourceIds.
    for (let booking of sortedBookings) {
        bestSwapMatch = locateBestMatches(booking, prefScoreTable, bookingsStartingToday, ghostMatrix);
        assignResourceIds(booking, bestSwapMatch, bookingsStartingToday, ghostMatrix);
        insertBookings([booking], ghostMatrix);
    }
    // Permanent insert into bossman
    insertBookings(bookingsStartingToday, availabilityGrid);
    return bookingsStartingToday; // This will be used to update the fullCalendar
}

/**
 * Helper function to validSwaps. This function will find all the bookings starting today, 
 * and return them in their object form using a hash function, so that we may access all their information. 
 */ 
function findBookingsStartingToday(ghostMatrix, visibleBookings, roomArray, currentDay) {
    const bookingMap = {};
    
    for (const booking of visibleBookings) {
        bookingMap[booking.bookingId] = booking;
    }

    let bookingsStartingToday = [];

    for (let i = 0; i < roomArray.length; i++) {
        if (String(ghostMatrix[roomArray[i]][currentDay]).includes("s")) {
            console.log(String(ghostMatrix[roomArray[i]][currentDay])); // Prints the s number
            bookingsStartingToday.push(String(ghostMatrix[roomArray[i]][currentDay]).replace(/s/g, ""));            
            console.log(bookingsStartingToday);
        }
    }

    let fullBookings = bookingsStartingToday.map(id => bookingMap[id]).filter(Boolean);

    // fullBookings array contains all the bookings starting today, represented as full booking objects.
    return fullBookings;
}

/**
 * Function that evaluates bookings, and returns a true or a false of possible/valid swaps for a single input booking.
 */
function validSwaps(booking, room, matrix, currentDay) {
    let bookingDuration = booking.stayDuration;
    if (String(matrix[room][currentDay]).includes("s") || matrix[room][currentDay] === 0) { 
        if (String(matrix[room][currentDay + bookingDuration]).includes("e") || matrix[room][currentDay + bookingDuration] === 0) {
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
    let currentBestIndex = -1;
    let counter = 0;

    for (let outerArray of prefScoreTable) {
        // Skip if the outer array is empty or not an array
        if (!Array.isArray(outerArray) || outerArray.length === 0) {
            counter++;
            continue;
        }

        // Loop th
        for (let pair of outerArray) {
            if (pair[0] === booking.bookingId && pair[1] > currentBest) {
                currentBest = pair[1];
                currentBestIndex = counter;
            }
        }
        counter++;
    }

    // Check if a valid best match was found. If a valid pair is found, reset the position
    if (currentBestIndex !== -1) {
        prefScoreTable[currentBestIndex] = [];
    }

    return currentBestIndex;
}

/**
 * WIP
 */
function assignResourceIds(booking, bestMatchFound, bookingsStartingToday, ghostMatrix) {
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
    let bookingToSwapWith = bookingsStartingToday[bestMatchFound];
    
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