import fs from 'fs/promises';
import { bookingsPath, roomsPath, loadBookings, loadRooms } from '../utils/getInfo.js';


async function matchBookingsToRooms() {   

    try {
        const { bookingsInfo } = await loadBookings();
        const { roomsInfo } = await loadRooms();
        console.log(bookingsInfo);
        // filter bookings by given Booking date
        

        // Sort bookings by earliest enddate
        //await sortBookings(bookingsInfo);

        // Loop through the bookings by dayOfBooking
        for (today=0; today <= 365; today++){
            const bookingsAtDate = getBookingsAtDate(bookingsInfo, today);
            console.log("Bookings at date: ", bookingsAtDate);
            for (booking of bookingsAtDate){
                if booking.avalible === 0){
            }
        }
//
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
function getVisibleBookings(bookingsInfo, date){
    for()
}
matchBookingsToRooms();


