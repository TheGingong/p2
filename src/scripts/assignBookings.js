import fs from 'fs/promises';
import dayjs from 'dayjs';
import { bookingsPath, roomsPath, loadBookings, loadRooms } from '../utils/getInfo.js';
import { checkAvailability, availabilityGrid, insertBooking, extendGrid, bookingRange } from './availabilityMatrix.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import { start } from 'repl';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

async function matchBookingsToRooms() {   
    try {
        // load data regarding bookings and room types
        const { bookingsInfo } = await loadBookings();
        const { roomsInfo } = await loadRooms();
        extendGrid(roomsInfo, bookingRange(bookingsInfo));
        // use function to create array of the bookings that should be visible for a given date
        const visibleBookings = await getVisibleBookings(bookingsInfo, '2025-02-09');
        console.log("visible:");
        console.log(visibleBookings);
        
        // Match bookings to rooms
        for (const booking of visibleBookings) {
            booking.resourceIds = await assignResId(booking, roomsInfo);
        } 

        // Updating resourceIds in bookings, to the newly assigned rooms
        await fs.writeFile(bookingsPath, JSON.stringify(bookingsInfo, null, 2));
        await fs.writeFile(roomsPath, JSON.stringify(roomsInfo, null, 2));
    
        // Inserts bookings in the Matrix where checkInDate === today
        const today = dayjs("2025-01-09");
        visibleBookings.forEach(booking => {
            if (booking.checkInDate === today){
                insertBookings(booking);
            }
        });

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
function timespanAvailability(roomNumber, startDate, endDate){
    let dayToCheck = dayjs(startDate)
    while (dayToCheck <= dayjs(endDate)){
        if (checkAvailability(roomNumber, dayToCheck) === 1) {
            dayToCheck = dayToCheck.add(1, 'day')
            continue;
        } else {
            return 0; // return 0 if span of time is OCCUPIED
        }
    }
    return 1; // return 1 if span of time is UNoccupied
}

matchBookingsToRooms();
