import fs from 'fs/promises';
import dayjs from 'dayjs';
import { bookingsPath, roomsPath, loadBookings, loadRooms } from '../utils/getInfo.js';
import { checkAvailability, availabilityGrid, insertBookings, extendGrid, bookingRange, dateDifference } from './availabilityMatrix.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import { start } from 'repl';
import { globalState } from "../utils/globalVariables.js";
export {getVisibleBookings, matchBookingsToRooms}

dayjs.extend(isSameOrBefore); 
dayjs.extend(isSameOrAfter);

async function matchBookingsToRooms() {   
    try {
        // load data regarding bookings and room types
        const { bookingsInfo } = await loadBookings();
        const { roomsInfo } = await loadRooms();
        //extendGrid(roomsInfo, bookingRange(bookingsInfo));
        // use function to create array of the bookings that should be visible for a given date
        const visibleBookings = await getVisibleBookings(bookingsInfo, globalState.currentDay);
        console.log(globalState.currentDay)
        console.log("visible:");
        console.log(visibleBookings);


        let arr = []
        // Match bookings to rooms
        for (const booking of visibleBookings) {
            booking.resourceIds = await assignResId(booking, roomsInfo);
            if (booking.resourceIds !== 0){
                if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')){
                    arr.push(booking)
                    //console.log(arr)
                    insertBookings(arr)
            }
            }



        } 
        console.log("visible2.0:");
        console.log(visibleBookings);
    
        // Inserts bookings in the Matrix where checkInDate === today
        let finalarray = []
        const today = dayjs(globalState.currentDay);
        visibleBookings.forEach(booking => {
            if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')){
                finalarray.push(booking);

            }
        });
        //insertBookings(finalarray);
        console.log("finalarray:");
        console.log(finalarray);
        return (finalarray)

    } catch (error) {
        console.error("Error updating bookings:", error);
    }
}


// Function that finds the best fit room, and returns its room number
async function assignResId(booking, rooms) {
    // Loop through
    for (const room of rooms) {
        if (booking.guestsNumber === room.roomGuests) {
            // Check occupation
            if(timespanAvailability(room.roomNumber, booking.checkInDate, booking.checkOutDate) === 1){
                
                return room.roomNumber;
            }
        }
        else {
            continue;
        }
    }
    console.log("didn't find any available rooms")
    return 0
}

// Function for sorting the bookings
function sortBookings(bookingsInfo){
    bookingsInfo.sort((a,b) => {
        const endDiff = new Date(a.checkOutDate) - new Date(b.checkOutDate)
    })
}
function getBookingsAtDate(bookingsInfo,date){
    const visibleBookings = bookingsInfo.filter((booking) => bookingsInfo.dayOfBooking === date);
    return visibleBookings
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
function timespanAvailability1(roomNumber, startDate, endDate){
    let dayToCheck = dayjs(startDate)
    while (dayToCheck <= dayjs(endDate)){
        if (checkAvailability(roomNumber, dayToCheck) === 0) {
            dayToCheck = dayToCheck.add(1, 'day')
            continue;
        } else {
            return 0; // return 0 if span of time is OCCUPIED
        }
    }
    return 1; // return 1 if span of time is UNoccupied
}




// function that checks for availability given a booking and a room over a span of time
function timespanAvailability(roomNumber, startDate, endDate){
    let dayToCheck = dayjs(startDate)
    for (let i = 0; i < dateDifference(startDate, endDate); i++) {
        let dag = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD');
        if (checkAvailability(roomNumber, dag) === 0) {
            continue;
        } else {
            return 0; // return 0 if span of time is OCCUPIED
        }
    }
    return 1; // return 1 if span of time is UNoccupied
}





//matchBookingsToRooms();