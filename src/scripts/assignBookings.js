/**
 * This file containts algorithms for allocating bookings to rooms, with focus on occupancy.
 * Includes the method for the 3 different allocations, depending on what version is pressed on page.
 */

import dayjs from 'dayjs';
import { loadBookings, loadRooms } from '../utils/getInfo.js';
import { checkAvailability, availabilityGrid, insertBookings, dateDifference } from './availabilityMatrix.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import { start } from 'repl';
import { globalState, roomsResourceIdToObject } from "../utils/globalVariables.js";
import { calculatePrefScore, calculatePrefScoreRandom } from '../utils/prefScores.js';
export { getVisibleBookings, matchBookingsToRooms, sortByDuration, timespanAvailability }

// Get plugings from dayjs.
dayjs.extend(isSameOrBefore); 
dayjs.extend(isSameOrAfter);

/**
 * Algorithm that optimizes bookings for occupancy, depending on button pressed case.
 * @param {Int} version - The version of algorithm. 0=bestFit, 1=sortByDuration, 2=Random.
 * @returns {Array} - Returns bookings that are visible to current day optimzed with ressourceIDs, bookings that were discarded
 * and if random button is pressed, the total total preference score for random.
 */
async function matchBookingsToRooms(version) {   
    try {
        // Load data for bookings and room types.
        const { bookingsInfo } = await loadBookings();
        const { roomsInfo } = await loadRooms();

        // Variables for calculating preference score, for random allocation.
        let totalRandomPrefScore = 0;
        let randomPrefScore = 0;

        // Use function to create array of the bookings that should be visible for a given date.
       const visibleBookings = await getVisibleBookings(bookingsInfo, globalState.currentDay);

        // Sort the array depending on what version of the fuction is called.
        if (version === 0 || version === 1){
            await sortByDuration(visibleBookings) // sort by duration of stay.
        }  // Else, do not sort if random allocation is pressed.

        // Makes a DEEP copy of the availabilityGrid.
        let tempMatrix = JSON.parse(JSON.stringify(availabilityGrid));
    
        // Arrays for holding discarded bookings and array of assigned bookings.
        let discardedBookings = [];
        let finalArray = []

        // Match bookings to rooms.
        for (let booking of visibleBookings) {
            if (version === 0){
                booking.resourceIds = await bestFit(booking, roomsInfo, tempMatrix); // If Best Fit version is called.
            } else { // Else, assign bookings in order/random.
                booking.resourceIds = await assignResId(booking, roomsInfo, tempMatrix);
            }



            // Insert into our temporary matrix.
            if (booking.resourceIds !== "0") {
                tempMatrix = insertBookings([booking], tempMatrix);
                
                // If this booking starts today, add it to our final array.
                if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')) {
                    // If version is 2, calculate preference score.
                    if (version === 2) {
                        randomPrefScore = await calculatePrefScoreRandom(booking, parseInt(booking.resourceIds));
                        totalRandomPrefScore += randomPrefScore;
                    }
                    // Title for booking, which will be visible in calendar.
                    booking.title = booking.guestsNumber + " " + randomPrefScore + " " + booking.bookingId;
                    finalArray.push(booking);
                }
            } else { // Else, push to array of discarded bookings.
                if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')) {
                    discardedBookings.push(booking);
                }
            }
        }
        
        // Update the real availability grid with today's new bookings.
        if (version === 2) {
            insertBookings(finalArray, availabilityGrid);
            return { finalArray, totalRandomPrefScore, discardedBookings };
        }
        return { visibleBookings, discardedBookings };

    } catch (error) {
        console.error("Error updating bookings:", error);
    }
}

/**
 * Function that assigns booking a resource ID, if room size matches and it's available.
 * @param {Object} booking - The booking we're trying to place.
 * @param {Array} rooms - Available room types.
 * @param {Object} tempMatrix - Current availability matrix.
 * @returns {String} roomNumber - The room number for the fitting room.
 */
async function assignResId(booking, rooms, tempMatrix) {
    // Loop through every room.
    for (const room of rooms) {
        if (booking.guestsNumber == room.roomGuests) { // If the room can occupy the guests.
            // Check if the room is available.
            if(timespanAvailability(room.roomNumber, booking.checkInDate, booking.checkOutDate, tempMatrix) === 1){
                return room.roomNumber; // Return room number, which will be assigned to booking ID.
            }

        }
        else {
            continue; // Else, move on to the next room.
        }
    }
    return "0";
}

/**
 * Get the visibleBookings for a specific date
 * @param {Array} bookingsInfo - The array of all bookings objects
 * @param {String} date - The specified date in a dayjs format
 * @returns {Array} - The array of all bookings that are visible
 */
async function getVisibleBookings(bookingsInfo, date) {
    // Parse the input date using dayjs
    let today = dayjs(date);

    // Initialize array for visible bookings
    let allocationArray = [];
    
    // For each booking, we check the constraints
    for (let x of bookingsInfo){
        let bookings = dayjs(x.dayOfBooking); 
        let checkdate = dayjs(x.checkInDate);
        // is the day of booking before today and is the check in date after today
        if (bookings <= today && checkdate >= today) {
            allocationArray.push(x)
        }
    }

    return allocationArray;
}
/**
 * Function that checks for availabilty for a given booking and room over a span of time.
 * @param {String} roomNumber - Room number corresponding to matrix index.
 * @param {String} startDate - dayjs string of booking start date.
 * @param {String} endDate - dayjs string of booking end date.
 * @param {Object} tempMatrix - Current availability matrix.
 * @returns {Integer} - Returns boolean, 0 if checked space is occupied, 1 if it is free.
 */
function timespanAvailability(roomNumber, startDate, endDate, tempMatrix){
    // For-loop that goes from the startDate to the endDate.
    for (let i = 0; i < dateDifference(startDate, endDate); i++) {
        let dag = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD');
        if (checkAvailability(roomNumber, dag, tempMatrix) === 0) {
            continue;
        } else {
            return 0; // Return 0 if span of time is OCCUPIED.
        }
    }
    return 1; // Return 1 if span of time is UNOCCUPIED.
}

/**
 * BestFit room algorithm that checks the space before and after a booking.
 * @param {Object} booking - The booking to assign a room to.
 * @param {Array} rooms - All rooms to check.
 * @param {Object} tempMatrix - Current availability matrix.
 * @returns {String} - The room number of the best fit room, or "0" if no room is available.
 */
async function bestFit(booking, rooms, tempMatrix) {
    // Filter rooms that can accommodate the number of guests.
    let eligibleRooms = rooms.filter(room => booking.guestsNumber == room.roomGuests);
    
    // If there are no eligible rooms, return "0".
    if (eligibleRooms.length === 0) {
        return "0";
    }
    
    // Create an array to store potential room matches, including their scores.
    let potentialMatches = [];
    
    // Check each eligible room for availability.
    for (const room of eligibleRooms) {
        // Check if the room is available for the entire booking period.
        if (timespanAvailability(room.roomNumber, booking.checkInDate, booking.checkOutDate, tempMatrix) === 1) {
            // Calculate various scores (the lower, the better).
            const proximityScore = calculateProximityToPreviousBooking(room.roomNumber, booking, tempMatrix); // Calculate slack behind
            const futureAvailabilityScore = calculateFutureAvailabilityScore(room.roomNumber, booking, tempMatrix); // Calculate slack in front
            
            /**
             * Below is the combined weighted score. Proximity to earlier bookings is the more important factor 
             * as these are set in stone. While we already know of some future bookings, we prioritize optimizing for current/known bookings.
             */
            const totalScore = (proximityScore * 0.8)  + (futureAvailabilityScore * 0.2);
            
            /**
             * Push details of checked room to potentialMatches array. 
             * Keep hold of the roomNumber, as this will be used to remember which room is the best.
             */
            potentialMatches.push({
                roomNumber: room.roomNumber,
                score: totalScore,
                proximity: proximityScore,
                futureAvail: futureAvailabilityScore
            });
        }
    }
    
    // If no available rooms were found, return "0".
    if (potentialMatches.length === 0) {
        return "0";
    }
    // Sort potential matches by score (ascending - the lower, the better).
    potentialMatches.sort((a, b) => a.score - b.score);
    
    // Return the room number of the best match (lowest index).
    return potentialMatches[0].roomNumber;
}

/**
 * Calculates how close a booking would be to previous bookings in the same room.
 * Lower score means better proximity (closer to previous bookings).
 * @param {String} roomNumber - The room number to check.
 * @param {Object} booking - The booking we're trying to place.
 * @param {Object} tempMatrix - Current availability matrix.
 * @returns {Integer} - Score representing days gap to closest previous booking.
 */
function calculateProximityToPreviousBooking(roomNumber, booking, tempMatrix) {
    // Check-in date, from which we will count backwards
    const checkInDate = dayjs(booking.checkInDate);
    
    // Search backwards from check-in date to find the most recent booking.
    let daysGap = 0;
    let maxDaysToCheck = 30; // Limit how far back we check.
    let foundPreviousBooking = false;
    
    // Count backwards until bookings is found, or 30 days have been checked
    for (let i = 1; i <= maxDaysToCheck; i++) {
        const prevDay = checkInDate.subtract(i, 'day').format('YYYY-MM-DD');
        
        /**
         * If room was occupied on this day, we've found a previous booking.
         * We assign daysGap=i, the amount of days since last booking
         */
        if (checkAvailability(roomNumber, prevDay, tempMatrix) === 1) {
            daysGap = i;
            foundPreviousBooking = true; 
            break;
        }
    }
    
    /**
     * If no previous booking were found within our search window,
     * assign a high score (we prefer rooms with previous bookings).
     */
    if (!foundPreviousBooking) {
        return 100; // High score if there were no previous bookings.
    }
    return daysGap; // Return the number of days gap (the smaller, the better).
}

/**
 * Evaluates how the booking affects future availability of the room.
 * @param {String} roomNumber - The room number.
 * @param {Object} booking - The booking being placed.
 * @param {Object} tempMatrix - Current availability matrix.
 * @returns {Number} - Score based on future impact (the lower, the better).
 */
function calculateFutureAvailabilityScore(roomNumber, booking, tempMatrix) {
    const checkOutDate = dayjs(booking.checkOutDate);
    let daysToCheck = 14; // Look an amount of days ahead. 
    
    /**
     * Check how many days after checkout the room stays empty.
     * This helps identify if this booking creates awkward gaps.
     */
    for (let i = 0; i < daysToCheck; i++) {
        const futureDay = checkOutDate.add(i, 'day').format('YYYY-MM-DD');
        
        // If the day after checkout already has a booking, that's ideal (the score stays low).
        if (checkAvailability(roomNumber, futureDay, tempMatrix) === 1) {
            // If -> then the room is booked on this future day.
            return i; // Return the gap size (0 is best - it means someone checks in right after checkout).
        }
    }
    // If we reach this point, there's at least a daysToCheck-day long gap after this booking. Return this number. 
    return daysToCheck;
}

/**
 * Sorting function that sorts given array based on longest stayDuration first.
 * Uses the built in function sort, which desides whether a or b is bigger, depending on their difference.
 * @param {Array} data - array that is to be sorted.
 * @param {Integer} data.stayDuration an int is found between to bookings' stayDuration, and the value is returned to data.sort, then used to sort.
 */
async function sortByDuration(data){
    data.sort((a,b) =>{
    return b.stayDuration - a.stayDuration;
    })
}