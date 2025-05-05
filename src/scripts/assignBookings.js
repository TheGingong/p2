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


        if (version === 0){
            await sortByBookingByStay(visibleBookings)
        } else if (version === 1){
            //await sortByBookingByCheckInDate(bookingsInfo)
            await sortByBookingByStayMinus(visibleBookings)
        } else { // else random
        }

         
        console.log(globalState.currentDay)
        //console.log("visible:");
        //console.log(visibleBookings);


        //console.log("BESTFIT_____________________________________")
        //for (const booking of visibleBookings) {
        //    bestFit(booking, roomsInfo);
        //}

        let tempMatrix = JSON.parse(JSON.stringify(availabilityGrid));

        let finalArray = []
        let arr = []
        // Match bookings to rooms
        for (const booking of visibleBookings) {
            booking.resourceIds = await assignResId(booking, roomsInfo, tempMatrix);
            //booking.title = booking.guestsNumber
            booking.title = booking.dayOfBooking

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

function bestFit(booking, rooms){
    let options = [];
    for(const room of rooms){
        if(booking.guestsNumber !== room.roomGuests){
            continue;
        }
        if(timespanAvailability(room.roomNumber, booking.checkInDate, booking.checkOutDate, tempMatrix) === 1){
            let dag = dayjs(booking.checkInDate)
            let count = 0;
            while(checkAvailability(room.roomNumber, dag, tempMatrix) === 0){
                dag = dag.subtract(1, 'day')
                count += 1;
            }
            options.push(count);
        }
    }
    console.log("bestfit ting");
    console.log(options);
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




// Improved findGap function to accurately locate the last occupied day
function findGap(roomNumber, checkInDate, tempMatrix) {
    let currentDate = dayjs(checkInDate).subtract(1, 'day');
    let gap = Infinity;
    
    // Scan backward to find the last occupied day
    while (currentDate.isSameOrAfter(dayjs('2000-01-01'))) {
        if (checkAvailability(roomNumber, currentDate.format('YYYY-MM-DD'), tempMatrix) === 0) {
            gap = dayjs(checkInDate).diff(currentDate, 'day');
            break;
        }
        currentDate = currentDate.subtract(1, 'day');
    }
    return gap;
}
async function assignResId2(booking, rooms, tempMatrix) {
    // Get all possible rooms that fit requirements
    const possibleRooms = rooms.filter(room => 
        booking.guestsNumber <= room.roomGuests &&
        timespanAvailability(room.roomNumber, booking.checkInDate, booking.checkOutDate, tempMatrix)
    );

    // No available rooms
    if (possibleRooms.length === 0) {
        console.log("No available rooms found");
        return 0;
    }

    // Calculate gaps and find the BEST fit
    let bestRoom = possibleRooms[0];
    let smallestGap = Infinity;

    for (const room of possibleRooms) {
        const gap = findGap(room.roomNumber, booking.checkInDate, tempMatrix);
        
        // Priority 1: Smallest gap
        // Priority 2: Smallest room size (if gaps are equal)
        if (gap < smallestGap || 
           (gap === smallestGap && room.roomGuests < bestRoom.roomGuests)) {
            smallestGap = gap;
            bestRoom = room;
        }
    }

    console.log(`Assigned to room ${bestRoom.roomNumber} with gap ${smallestGap} days`);
    return bestRoom.roomNumber;
}