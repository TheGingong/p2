import { readFile } from 'fs/promises'; // Imports function readFile from File System library
export { roomsInfo, bookingsInfo, loadBookings };

let roomsInfo = null;
let bookingsInfo = null;

async function loadBookings() {
    try {
        // Calls readFile on bookings and rooms respectively
        const bookingsData = await readFile('src/json/bookings.json', 'utf8');
        const roomsData = await readFile('src/json/rooms.json', 'utf8');

        roomsInfo = JSON.parse(roomsData);
        bookingsInfo = JSON.parse(bookingsData);

        return { roomsInfo, bookingsInfo }; // Return the loaded data
    } catch (err) {
        console.error("Error reading files:", err);
        throw err; // Ensure errors are propagated
    }
}

//console.log("Rooms Loaded:", Rooms);
//console.log("Bookings Loaded:", Bookings);
// Now, Rooms and Bookings will have data after loading


