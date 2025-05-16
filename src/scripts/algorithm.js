/**
 * This file contains the functions, that will perform most of the operations required for our optimization of hotel bookings. 
 * Comparisons and swaps are made, as well as defining the necessary subfunctions. 
 */
import { globalState, roomsIndexToResourceId, roomsResourceIdToObject } from "../utils/globalVariables.js";
import { calculatePrefScore, prefScoreArray } from "../utils/prefScores.js";
import { dateIndex, availabilityGrid, insertBookings } from "./availabilityMatrix.js";
import { roomsInfo } from "../utils/getInfo.js";
import { timespanAvailability } from "./assignBookings.js";
export { preferenceOptimization }

/**
 * Main optimzation function, which will call on subfunctions to optimize hotel bookings according to certain variables.
 * @param {Array} visibleBookings Array containing all the bookings that have been placed today or before
 * @param {Float} totalPrefScore Number that is parsed and updated by adding/subtracting the new pref score
 * @returns {Object} The resulting array of bookings starting today, and the total prefscore is returned in an object
 */
async function preferenceOptimization(visibleBookings, totalPrefScore) {
    let currentDay = dateIndex(globalState.currentDay);

    // Initialize empty matrix.
    let ghostMatrix = JSON.parse(JSON.stringify(availabilityGrid));

    // Transfer visible bookings into the empty ghostMatrix.
    insertBookings(visibleBookings, ghostMatrix);
    
    let roomArray = [];

    // Fills empty roomArray with the numbers of all the rooms in the hotel.
    for (let room of roomsInfo) {
        roomArray.push(room.roomNumber);
    }

    // Finds bookings starting today and places them in an array.
    let bookingsStartingToday = findBookingsStartingToday(ghostMatrix, visibleBookings, roomArray, currentDay);
    let bookingPrefScore = 0;
    let prefScoreTable = [];
    let bestSwapMatch = 0;

    // Iterate through the bookings in the bookingsStartingToday array.
    for (let booking of bookingsStartingToday) {
        for (let i = 0; i < roomArray.length; i++) {
            // Checks if the room i is a valid swap for the booking of bookingsStartingToday.
            if (validSwaps(booking, roomArray[i])) {
                // If its a valid swap, calculate the preference score.
                bookingPrefScore = await calculatePrefScore(booking, roomArray[i]);
                
                // Ensure the room index in prefScoreTable is initialized.
                if (!Array.isArray(prefScoreTable[i])) {
                    prefScoreTable[i] = [];
                }

                // Push the preference score at the right room index, to the booking that will get that specific score at that location.
                prefScoreTable[i].push([booking.bookingId, bookingPrefScore]);
            } else {
                if (!Array.isArray(prefScoreTable[i])) {
                    prefScoreTable[i] = [];
                }
                prefScoreTable[i].push([booking.bookingId, -1]);
            }
        }
    }
    
    // Find the right prioritization of the bookings starting today array.
    let sortedBookings = prioritySwaps(bookingsStartingToday);

    // For-loop that iterates over the sortedBookings to find the best matches and assigning resourceIds.
    for (let booking of sortedBookings) {
        let results = locateBestMatches(booking, prefScoreTable, roomArray);
        bestSwapMatch = results.currentBestIndex;
        totalPrefScore += results.prefScore;
        booking.title = booking.bookingId + " Guests: " + booking.guestsNumber + " Pref: " + results.prefScore;
        assignResourceIds(booking, bestSwapMatch, bookingsStartingToday);

        // Takes the preference score corresponding to the best match for the booking and pushes it booking.stayDuration times into the array.
        for (let i = 0; i < booking.stayDuration; i++) {
            prefScoreArray.push(results.prefScore);
        }
    }
    // This return statement will be used to update fullCalendar.
    return { bookingsStartingToday, totalPrefScore };
}

/**
 * Helper function to validSwaps. This function will find all the bookings starting today, 
 * and return them in their object form using a hash function, so that we may access all their information.
 * @param {Matrix} ghostMatrix Matrix that is made based on the general booking matrix, is used for comparisons
 * @param {Array} visibleBookings Array containing all the bookings that have been placed today or before
 * @param {Array} roomArray Array containing the room numbers of all the rooms in the hotel
 * @param {String} currentDay string readible through Day.js, indicated the current day in the simulation
 * @returns {Array} fullBookings, which is an array of oebjects, constructed by mapping bookings starting today to their original objects
 */ 
function findBookingsStartingToday(ghostMatrix, visibleBookings, roomArray, currentDay) {
    const bookingMap = {};
    
    // Maps a booking's object/information through the booking number, which is the key. 
    for (const booking of visibleBookings) {
        bookingMap[booking.bookingId] = booking;
    }

    let bookingsStartingToday = [];

    /**
     * For-loop, that checks the matrix, and finds the bookings starting today,  
     * indicated by an 's' before the booking ID in the matrix. 
     */ 
    for (let i = 0; i < roomArray.length; i++) {
        if (String(ghostMatrix[roomArray[i]][currentDay]).includes("s")) {
            bookingsStartingToday.push(String(ghostMatrix[roomArray[i]][currentDay]).replace(/s/g, ""));            
        }
    }
    
    // fullBookings array contains all the bookings starting today, represented as full booking objects.
    let fullBookings = bookingsStartingToday.map(id => bookingMap[id]).filter(Boolean);
    return fullBookings;
}

/**
 * Function that evaluates bookings, and returns a true or a false of possible/valid swaps for a single input booking.
 * validSwaps is designed to only handle a single booking and a single room, and therefore be called in a for-loop when needed. 
 * @param {Object} booking The object of the singular booking currently considered
 * @param {Integer} room The number of the room currently considered
 * @returns {Boolean} True/false, wether the swap is valid
 */
function validSwaps(booking, room) {
    if (booking.guestsNumber == roomsResourceIdToObject[room].roomGuests) {
        return true;
    }
    return false;
}

/**
 * Prioritizes the bookings starting today, s.t. first booking is the booking we earn the most score from (least amount of prefs).
 * @param {Array} booksStartingToday Array containing the bookings that need to be sorted
 * @returns {Array} Priority sort done on the parsed array
 */
function prioritySwaps(booksStartingToday) {
    // Creates a copy of the array so it doesn't directly change the bookingsStartingToday array, as we need this later in the swap.
    let sortedArray = [...booksStartingToday];
    
    // Sorts the bookings starting today, with the following arrow-function as compare function.
    sortedArray.sort((booking1, booking2) => {
        // If the two bookings are not of the same stayduration, sort them longest to shortest.
        if (booking1.stayDuration !== booking2.stayDuration) {
            return booking2.stayDuration - booking1.stayDuration;
        }
        /**
         * Else, sort them based on how many preferences the bookings have. Bookings with the least prefs 
         * come first (as a single pref carries more weight for these), followed by bookings with more preferences.
         */
        return Object.keys(booking1.preference).length - Object.keys(booking2.preference).length;
    })
    return sortedArray;
}

/**
 * Funtion that searches and finds the best room matching a booking's preferences.
 * @param {Object} booking - The object for a single booking, containing all the booking's information
 * @param {Array} prefScoreTable - Array, containing nested arrays with booking and their prefscores for the associated rooms
 * @param {Array} roomArray - Array containing all room numbers for the hotel
 * @returns {Object} object containing the index of the best room match, and the corresponding prefscore
 */ 
function locateBestMatches(booking, prefScoreTable, roomArray) {
    let currentBestScore = -Infinity;
    let currentBestIndex = -1;
    let prefScore = 0;

    for (let i = 0; i < prefScoreTable.length; i++) {
        const roomNum = roomArray[i];
        const roomScores = prefScoreTable[i];

        // Skip if there's no score, or room is not available.
        if (!Array.isArray(roomScores) || roomScores.length === 0) continue;
        
        // Checks if the room is actually valid. Meaning that the room is not locked in availability grid.
        if (!timespanAvailability(roomNum, booking.checkInDate, booking.checkOutDate, availabilityGrid)) continue;

        for (let [bookingId, score] of roomScores) {
            if (bookingId === booking.bookingId && score > currentBestScore) {
                currentBestScore = score;
                currentBestIndex = i;
                console.log("Current best room for BK: " + bookingId + " is " + roomArray[i]);
            }
        }
    }

    // Update totalPrefScore.
    prefScore += currentBestScore;

    // Clear used score slot if match was found.
    if (currentBestIndex !== -1) {
        prefScoreTable[currentBestIndex] = [];
    }

    return { currentBestIndex, prefScore };
}

/**
 * Assigns resourceIds to the bookings that will swap.
 * @param {Object} booking - An object containing the information of a single booking
 * @param {Integer} bestMatchFound - Index of the best max in prefscoreTable
 * @param {Array} bookingsStartingToday - Array of bookings with checkindate = currentday
 * @returns Only occurs on errors, otherwise the data is modified live without being returned
 */
async function assignResourceIds(booking, bestMatchFound, bookingsStartingToday) {
    const roomNumberToBookingObject = bookingsStartingToday.reduce((hash, booking) => {
        hash[booking.resourceIds] = booking;
        return hash;
    }, {});
    
    // Ensure the room is found - Error handling.
    if (!roomsIndexToResourceId[bestMatchFound]) {
        console.error(`Invalid index: ${bestMatchFound}`);
        return;
    }
    
    // Give an index and return the room object corresponding to that index.
    const roomDetails = roomsIndexToResourceId[bestMatchFound];
    
    let bookingToSwapWith = roomNumberToBookingObject[roomDetails.roomNumber] || null;
    
    // Swap the resource IDs around.
    console.log("Successful swap: " + booking.bookingId + " in room " + booking.resourceIds + " to room " + roomDetails.roomNumber);
    
    let tempResourceId = booking.resourceIds;
    booking.resourceIds = roomDetails.roomNumber;

    if (bookingToSwapWith !== null) {
        bookingToSwapWith.resourceIds = tempResourceId;
    }

    insertBookings([booking], availabilityGrid);
}