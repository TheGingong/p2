import { readFile } from 'fs/promises'; // Imports function readFile from File System library
import path from 'path'
import { fileURLToPath } from 'url';
export { roomsInfo, bookingsInfo, loadBookings, loadRooms };

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let roomsInfo = null;
let bookingsInfo = null;

async function loadBookings() {
    try {
        // Calls readFile on bookings and rooms respectively
        // Use absolute paths for the JSON files
        const bookingsPath = path.resolve(__dirname, '../json/bookings.json');

        // Calls readFile on bookings
        const bookingsData = await readFile(bookingsPath, 'utf8');

        bookingsInfo = JSON.parse(bookingsData);

        return { bookingsInfo }; // Return the loaded data
    } catch (err) {
        console.error("Error reading files:", err);
        throw err; // Ensure errors are propagated
    }
}

async function loadRooms() {
    try {
        // Use absolute paths for the JSON files
        const roomsPath = path.resolve(__dirname, '../json/rooms.json');

        // Calls readFile on rooms
        const roomsData = await readFile(roomsPath, 'utf8');

        roomsInfo = JSON.parse(roomsData);

        return { roomsInfo }; // Return the loaded data
    } catch (err) {
        console.error("Error reading files:", err);
        throw err; // Ensure errors are propagated
    }
}