/**
 * This file contains functions and associated helper functions, 
 * that are in charge of generating the data on the simulated hotel's rooms.
 */
import fs from 'fs/promises'
import { prefOddsRooms, buildingFloors, roomsPerFloor, maxGuests } from '../utils/globalVariables.js'
import { generateSoftPrefs, generateRoomTypes } from '../utils/preferences.js'
export { generateRoomNumber, generateRooms, generateGuests, generateRoomTypes }

/** 
 * Function that will generate all rooms using other functions, 
 * and write them into the json file through an array.
 */ 
async function generateRooms () {
    // Defines the file path for rooms.json file.
    const roomsPath = "src/json/rooms.json";

    // Prepares to write the data we will generate to the rooms.json file. Begins the array with a '['. 
    await fs.writeFile(roomsPath, "[\n", "utf8");

    // Loop that generates rooms, and inserts them into the array for a said amount of rooms per floor for each floor.
    for (let i = 1; i <= buildingFloors; i++) {
        for (let j = 1; j <= roomsPerFloor; j++) {
            // Generate room number, console log for progress reports. 
            let roomNumber = generateRoomNumber(i, j)
            console.log(`Room Number (${i}, ${j}):`, roomNumber);
            // Generate amount of maximum guest space.
            let guests = generateGuests(maxGuests);
            // Generate object to hold preferences, followed by generation of preferences to fill object.
            let preference = {};
            generateRoomTypes(guests, preference, i);
            generateSoftPrefs(preference, prefOddsRooms, 0);

            let roomObject = {
                "roomNumber" : roomNumber,
                "roomGuests" : guests,
                "preference" : preference
            };

            // Convert to JSON string.
            let roomData = JSON.stringify(roomObject, null, 2);

            // If not the first entry, add a comma to follow array syntax.
            if (i !== 1 || j !== 1) {
            roomData = ",\n" + roomData;
            }

            await fs.appendFile(roomsPath, roomData, "utf8");
        }
    }
    await fs.appendFile(roomsPath, "\n]", "utf8");
}

/**
 * Function that generates a room number, adding the floor and the room number.
 * E.g. room number "109" is room 9 on floor 1.
 * @param {Integer} roomFloor - The floor the room is placed on
 * @param {Integer} roomNumber - The room's number
 * @returns {String} room number string
 */
function generateRoomNumber(roomFloor, roomNumber) {
    if (roomNumber < 10) {return roomFloor.toString() +  "0" + roomNumber.toString()}
    else {return roomFloor.toString() + roomNumber.toString()};
}

/**
 * Function that generates a random amount of guest space for a room.
 * @param {Integer} maximumGuests Acts as the maximum value for a random generatoin of an int
 * @returns {Integer} Random value from 0 to a given maximum
 */
function generateGuests (maximumGuests) {
    return Math.floor((Math.random() * maximumGuests) + 1);
}