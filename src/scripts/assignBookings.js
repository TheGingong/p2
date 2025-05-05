import fs from 'fs/promises';
import dayjs from 'dayjs';
import { bookingsPath, roomsPath, loadBookings, loadRooms } from '../utils/getInfo.js';
import { checkAvailability, availabilityGrid, insertBookings, extendGrid, bookingRange, dateDifference, dateIndex } from './availabilityMatrix.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import { start } from 'repl';
import { globalState } from "../utils/globalVariables.js";
import { sortByBookingByCheckInDate, sortByBookingByStay, sortByBookingByStayMinus} from '../utils/impartial.js';
export {getVisibleBookings, matchBookingsToRooms}

dayjs.extend(isSameOrBefore); 
dayjs.extend(isSameOrAfter);

async function matchBookingsToRooms(version) {   
    try {
        // load data regarding bookings and room types
        const { bookingsInfo } = await loadBookings();
        const { roomsInfo } = await loadRooms();
        //extendGrid(roomsInfo, bookingRange(bookingsInfo));
        // use function to create array of the bookings that should be visible for a given date
        
        //await sortByBookingByCheckInDate(bookingsInfo)
       const visibleBookings = await getVisibleBookings(bookingsInfo, globalState.currentDay);


        if (version === 0 || version === 1){
            await sortByBookingByStay(visibleBookings)
        } else { // else random
        }

         
        console.log(globalState.currentDay)
        //console.log("visible:");
        //console.log(visibleBookings);

        let tempMatrix = JSON.parse(JSON.stringify(availabilityGrid));

        let finalArray = []
        let arr = []
        // Match bookings to rooms
        for (const booking of visibleBookings) {

            if (version === 0){
                booking.resourceIds = await bestFit(booking, roomsInfo, tempMatrix);
            } else { // else random
                booking.resourceIds = await assignResId(booking, roomsInfo, tempMatrix);
            }

            //booking.title = booking.guestsNumber
            booking.title = booking.dayOfBooking + ", Duration =  " + booking.stayDuration

            if (booking.resourceIds !== "0") {
                tempMatrix = insertBookings([booking], tempMatrix);
                
                // If this booking starts today, add it to our final array
                if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')) {
                    finalArray.push(booking);
                }
            } else {
                console.log(`No room found for booking ${booking.id}`);
            }
        }
        
        // Update the real availability grid with today's new bookings
        insertBookings(finalArray, availabilityGrid);
        
        //console.log("Final bookings to display:", finalArray.length);
        return finalArray;
    } catch (error) {
        console.error("Error updating bookings:", error);
    }
}


// Function that finds the best fit room, and returns its room number
async function assignResId(booking, rooms, tempMatrix) {
    // Loop through

    for (const room of rooms) {
        if (booking.guestsNumber <= room.roomGuests) {
            // Check occupation
            if(timespanAvailability(room.roomNumber, booking.checkInDate, booking.checkOutDate, tempMatrix) === 1){
                return room.roomNumber;
            }
        }
        else {
            continue;
        }
    }
    console.log("Didn't find any available rooms")
    return "0";
}


async function getVisibleBookings(bookingsInfo, date) {
    // Parse the input date using dayjs
    let today = dayjs(date);

    // Initialize array for visible bookings
    let allocationArray = [];

    // For hver booking checker vi constrains
    for (let x of bookingsInfo){
        let bookings = dayjs(x.dayOfBooking);
        let checkdate = dayjs(x.checkInDate);
        if (bookings <= today && checkdate >= today) {
            allocationArray.push(x)
        }
    }

    //console.log("allocationArray:");
    //console.log(allocationArray);
    return allocationArray;
}

// function that checks for availability given a booking and a room over a span of time
function timespanAvailability(roomNumber, startDate, endDate, tempMatrix){
    let dayToCheck = dayjs(startDate)
    for (let i = 0; i < dateDifference(startDate, endDate); i++) {
        let dag = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD');
        if (checkAvailability(roomNumber, dag, tempMatrix) === 0) {
            continue;
        } else {
            return 0; // return 0 if span of time is OCCUPIED
        }
    }
    return 1; // return 1 if span of time is UNoccupied
}







/**
 * Advanced room assignment algorithm with multi-factor scoring
 * @param {Object} booking - The booking to assign a room to
 * @param {Array} rooms - Available room types
 * @param {Array} tempMatrix - Current availability matrix
 * @returns {String} - The room number of the best fit room, or "0" if no room is available
 */
async function bestFit(booking, rooms, tempMatrix) {
    // Filter rooms that can accommodate the number of guests
    let eligibleRooms = rooms.filter(room => booking.guestsNumber <= room.roomGuests);
    
    // If no eligible rooms, return "0"
    if (eligibleRooms.length === 0) {
        return "0";
    }
    
    // Create an array to store potential room matches with their scores
    let potentialMatches = [];
    
    // Check each eligible room for availability
    for (const room of eligibleRooms) {
        // Check if room is available for the entire booking period
        if (timespanAvailability(room.roomNumber, booking.checkInDate, booking.checkOutDate, tempMatrix) === 1) {
            // Calculate various scores (lower is better)
            const proximityScore = calculateProximityToPreviousBooking(room.roomNumber, booking, tempMatrix);
            const futureAvailabilityScore = calculateFutureAvailabilityScore(room.roomNumber, booking, tempMatrix);
            
            // Combined weighted score (adjust weights to fine-tune algorithm performance)
            const totalScore = (proximityScore * 0.8)  + (futureAvailabilityScore * 0.2);
            
            potentialMatches.push({
                roomNumber: room.roomNumber,
                score: totalScore,
                proximity: proximityScore,
                futureAvail: futureAvailabilityScore
            });
        }
    }
    
    // If no available rooms were found, return "0"
    if (potentialMatches.length === 0) {
        return "0";
    }
    
    // Sort potential matches by score (ascending - lower is better)
    potentialMatches.sort((a, b) => a.score - b.score);
    
    // For debugging (can be removed in production)
    // console.log("Room options for booking", booking.id, potentialMatches.map(m => 
    //    `Room ${m.roomNumber}: score=${m.score.toFixed(2)} (prox=${m.proximity}, cap=${m.capacity}, future=${m.futureAvail})`
    // ));
    
    // Return the room number of the best match
    return potentialMatches[0].roomNumber;
}

/**
 * Calculates how close a booking would be to previous bookings in the same room
 * Lower score means better proximity (closer to previous bookings)
 * @param {String} roomNumber - The room number to check
 * @param {Object} booking - The booking we're trying to place
 * @param {Array} tempMatrix - Current availability matrix
 * @returns {Number} - Score representing days gap to closest previous booking
 */
function calculateProximityToPreviousBooking(roomNumber, booking, tempMatrix) {
    const checkInDate = dayjs(booking.checkInDate);
    
    // Search backwards from check-in date to find the most recent booking
    let daysGap = 0;
    let maxDaysToCheck = 30; // Limit how far back we check
    let foundPreviousBooking = false;
    
    for (let i = 1; i <= maxDaysToCheck; i++) {
        const prevDay = checkInDate.subtract(i, 'day').format('YYYY-MM-DD');
        
        // If room was occupied on this day, we've found a previous booking
        if (checkAvailability(roomNumber, prevDay, tempMatrix) === 1) {
            daysGap = i;
            foundPreviousBooking = true; 
            break;
        }
    }
    
    // If no previous booking was found within our search window,
    // assign a high score (we prefer rooms with previous bookings)
    if (!foundPreviousBooking) {
        return 100; // High score for no previous bookings
    }
    
    return daysGap; // Return the number of days gap (smaller is better)
}

/**
 * Calculates how well the room capacity matches the booking requirements
 * @param {Object} room - The room object
 * @param {Object} booking - The booking object
 * @returns {Number} - Score representing how well capacity matches (lower is better)
 */
function calculateCapacityScore(room, booking) {
    // Calculate the "waste" - how many unused beds
    const waste = room.roomGuests - booking.guestsNumber;
    
    // Perfect match (no waste) gets lowest score
    if (waste === 0) return 0;
    
    // Otherwise, score increases with waste (but not too harshly)
    return waste * 5;
}

/**
 * Evaluates how the booking affects future availability of the room
 * @param {String} roomNumber - The room number
 * @param {Object} booking - The booking being placed
 * @param {Array} tempMatrix - Current availability matrix
 * @returns {Number} - Score based on future impact (lower is better)
 */
function calculateFutureAvailabilityScore(roomNumber, booking, tempMatrix) {
    const checkOutDate = dayjs(booking.checkOutDate);
    let score = 0;
    let daysToCheck = 14; // Look ahead 2 weeks
    
    // Check how many days after checkout the room stays empty
    // This helps identify if this booking creates awkward gaps
    for (let i = 0; i < daysToCheck; i++) {
        const futureDay = checkOutDate.add(i, 'day').format('YYYY-MM-DD');
        
        // If the day after checkout already has a booking, that's ideal (score stays low)
        if (checkAvailability(roomNumber, futureDay, tempMatrix) === 1) {
            // Room is booked on this future day - good!
            return i; // Return the gap size (0 is best - someone checks in right after checkout)
        }
    }
    
    // If we get here, there's at least a 2-week gap after this booking
    return daysToCheck;
}