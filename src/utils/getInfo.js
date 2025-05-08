/**
 * This file contains the two functions loadBookings and loadRooms, which will open the JSON files
 * containing the generated bookings and all individual rooms of the hotel. 
 * In both cases, the loaded and then returned data is an array 
 * containing objects with the necessary information for a room or booking. 
 */

import { readFile } from 'fs/promises'; // Imports function readFile from File System library.
import path from 'path'
import { fileURLToPath } from 'url';
export { roomsInfo, bookingsInfo, loadBookings, loadRooms, bookingsPath, roomsPath,visibleJsonPath};

// Get the directory of the current file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let roomsInfo = null;
let bookingsInfo = null;

// Use absolute paths for the JSON files.
const bookingsPath = path.resolve(__dirname, '../json/bookings.json')
const roomsPath = path.resolve(__dirname, '../json/rooms.json');
const visibleJsonPath = path.resolve(__dirname, '../json/visibleBookings.json')

/**
 * Reads bookings from json file, parses and returns for export and usage.
 * @returns {Array} - Array of booking objects
 */
async function loadBookings() {
    try {
        // Calls readFile on bookings.
        const bookingsData = await readFile(bookingsPath, 'utf8');

        bookingsInfo = JSON.parse(bookingsData);

        return { bookingsInfo }; // Return the loaded data.
    } catch (err) {
        console.error("Error reading files:", err);
        throw err; // Ensure errors are propagated
    }
}

/**
 * Reads rooms from json file, parses and returns for export and usage.
 * @returns {Array} - Array of room objects
 */
async function loadRooms() {
    try {
        // Calls readFile on rooms.
        const roomsData = await readFile(roomsPath, 'utf8');

        roomsInfo = JSON.parse(roomsData);

        return { roomsInfo }; // Return the loaded data.
    } catch (err) {
        console.error("Error reading files:", err);
        throw err; // Ensure errors are propagated.
    }
}