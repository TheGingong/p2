import fs from 'fs/promises';
import dayjs from 'dayjs';
import { bookingsPath, roomsPath, loadBookings, loadRooms } from '../utils/getInfo.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

async function matchBookingsToRooms() {   
    try {
        // load data regarding bookings and room types
        const { bookingsInfo } = await loadBookings();
        const { roomsInfo } = await loadRooms();
        // use function to create array of the bookings that should be visible for a given date
        const visibleBookings = await getVisibleBookings(bookingsInfo, "2025-03-09");
        
        
        // filter bookings by given Booking date

        // Sort bookings by earliest enddate
        //await sortBookings(bookingsInfo);

        // Loop through the bookings by dayOfBooking
        //for (today=0; today <= 365; today++){
        //    const bookingsAtDate = getBookingsAtDate(bookingsInfo, today);
        //    console.log("Bookings at date: ", bookingsAtDate);
        //    for (booking of bookingsAtDate){
        //        if booking.avalible === 0){
        //    }
        //}

        // Match bookings to rooms
        for (const booking of bookingsInfo) {
            booking.resourceIds = await assignResId(booking, roomsInfo);
        } 

        // Updating resourceIds in bookings, to the newly assigned rooms
        await fs.writeFile(bookingsPath, JSON.stringify(bookingsInfo, null, 2));
        await fs.writeFile(roomsPath, JSON.stringify(roomsInfo, null, 2));

    } catch (error) {
        console.error("Error updating bookings:", error);
    }
}


// Function that finds the best fit room, and returns its room number
async function assignResId(booking, rooms) {
    // Loop through
    for (const room of rooms) {
        // Check occupation
        if (room.roomOcc === 1){
            continue;
        }
        if (booking.guestsNumber === room.roomGuests) {
            // Return room number or some other identifier
            room.roomOcc = 1;
            return room.roomNumber;
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

    console.log("allocationArray:");
    console.log(allocationArray);
    return allocationArray;
}


matchBookingsToRooms();