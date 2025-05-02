import fs from 'fs/promises';
import dayjs from 'dayjs';
import { bookingsPath, roomsPath, loadBookings, loadRooms } from '../utils/getInfo.js';
import { checkAvailability, availabilityGrid, insertBookings, extendGrid, bookingRange, dateDifference, dateIndex } from './availabilityMatrix.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import { start } from 'repl';
import { globalState } from "../utils/globalVariables.js";
import { sortByBookingByCheckInDate } from '../utils/impartial.js';
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
        
        await sortByBookingByCheckInDate(bookingsInfo)
        const visibleBookings = await getVisibleBookings(bookingsInfo, globalState.currentDay);
        console.log(globalState.currentDay)
        //console.log("visible:");
        //console.log(visibleBookings);


        //console.log("BESTFIT_____________________________________")
        //for (const booking of visibleBookings) {
        //    bestFit(booking, roomsInfo);
        //}

        let tempMatrix = availabilityGrid

        let arr = []
        // Match bookings to rooms
        for (const booking of visibleBookings) {
            booking.resourceIds = await assignResId(booking, roomsInfo, tempMatrix);
            booking.title = booking.guestsNumber

            if (booking.resourceIds !== 0){
                //if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')){ // Old check if we were to send final array (day of checkin)
                    arr.push(booking)
                    //console.log(arr)
                    insertBookings(arr, tempMatrix)
            //}
            }
        } 
        console.log("visible2.0:");
        //console.log(visibleBookings);
    
        // Inserts bookings in the Matrix where checkInDate === today
        let finalarray = []
        const today = dayjs(globalState.currentDay);

        visibleBookings.forEach(booking => {
            if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')){
                finalarray.push(booking);

            }
        });
        //insertBookings(finalarray);
        //console.log("finalarray:");
        //console.log(finalarray);
        return visibleBookings
        //return finalarray
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
    return 0
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
        if (bookings <= today && checkdate >= today) { // Maybe change this to checkOutDate > today
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
