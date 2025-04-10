import { readFile } from 'fs/promises'; // Imports function readFile from File System library
export { roomsInfo, bookingsInfo, loadBookings, loadRooms };

let roomsInfo = null;
let bookingsInfo = null;

async function loadBookings() {
    try {
        // Calls readFile on bookings
        const bookingsData = await readFile('src/json/bookings.json', 'utf8');

        bookingsInfo = JSON.parse(bookingsData);

        return { bookingsInfo }; // Return the loaded data
    } catch (err) {
        console.error("Error reading files:", err);
        throw err; // Ensure errors are propagated
    }
}

async function loadRooms() {
    try {
        // Calls readFile on rooms respectively
        const roomsData = await readFile('src/json/rooms.json', 'utf8');

        roomsInfo = JSON.parse(roomsData);

        return { roomsInfo }; // Return the loaded data
    } catch (err) {
        console.error("Error reading files:", err);
        throw err; // Ensure errors are propagated
    }
}

//console.log("Rooms Loaded:", Rooms);
//console.log("Bookings Loaded:", Bookings);
// Now, Rooms and Bookings will have data after loading


