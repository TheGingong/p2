import fs from 'fs/promises'
import { roomTypes } from '../utils/globalVariables.js';
import { buildingFloors, roomsPerFloor, maxGuests } from '../utils/globalVariables.js'
import { bookingsInfo, loadBookings } from '../utils/getInfo.js';
export { generateRoomNumber, generateRooms, generateGuests, generateRoomTypes }

let preference = {};

/** 
 * Function that will generate all rooms using other functions, 
 * and write them into the json file through an array.
 */ 
async function generateRooms () {
    // Defines the file path for rooms.json file.
    const roomsPath = "src/json/rooms.json";

    // Prepares to write the data we will generate to the rooms.json file. 
    await fs.writeFile(roomsPath, "[\n", "utf8");

    // Loop that generates rooms, and inserts them into the array for a said amount of rooms per floor for each floor.
    for (let i = 1; i <= buildingFloors; i++) {
        for (let j = 1; j <= roomsPerFloor; j++) {
            console.log(`Room Number (${i}, ${j}):`, generateRoomNumber(i, j));
            let guests = generateGuests(maxGuests);
            generateRoomTypes(guests)
            let roomObject = {
                "roomNumber" : generateRoomNumber(i, j),
                "roomGuests" : guests,
                "preference" : preference,
            };

            // Convert to JSON string.
            let roomData = JSON.stringify(roomObject, null, 2);

            // if not the first entry, add a comma for valid JSON.
            if (i !== 1 || j !== 1) {
            roomData = ",\n" + roomData;
            }

            // Append data to the file.
            await fs.appendFile(roomsPath, roomData, "utf8");
        }
    }
    await fs.appendFile(roomsPath, "\n]", "utf8");
}

/**
 * Function that generates a roomnumber adding the floor and the roomnumber.
 * @param {Integer} roomFloor - The floor the rooms i placed on
 * @param {Integer} roomNumber - The rooms number
 * @returns {String} - roomnumber string
 */
function generateRoomNumber(roomFloor, roomNumber) {
    if (roomNumber < 10) {return roomFloor.toString() +  "0" + roomNumber.toString()}
    else {return roomFloor.toString() + roomNumber.toString()};
}

/**
 * Function that generates a random amount of guest space for a room.
 */
function generateGuests (maximumGuests) {
    return Math.floor((Math.random() * maximumGuests) + 1);
}

/**
 * Function that generates the room preferences depending on amount of guests, through use of a switch case.
 */
function generateRoomTypes(numberOfGuests) {
    // Generate room preference. 
    switch(numberOfGuests) {
        case 1:
            return preference.beds = roomTypes[0]; // One single bed
        case 2:
            return preference.beds = roomTypes[Math.ceil(Math.random() * 2)]; // 2 single bed or 1 queen bed
        case 3:
            return preference.beds = roomTypes[3]; // One single bed and 1 queen bed
        case 4:
            return preference.beds = roomTypes[4]; // 2 queen beds
        default:
            console.log("Something went wrong. Too many guests.");
    }
}