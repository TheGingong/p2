/** 
 * This is a file for all the global variables that we use throughout the program files.
 * These variables are meant to be changed and imported/exported multiple times.
 * Having them here is just to get a better overview of them instead of having to go through each individual file where they may be used.
 * This is also meant to store variables that we want to change to test the program, such as the amount of rooms/guests, etc.
 * The following variables are included:
 * @global {buildingFloors} - The amount of floors in the hotel
 * @global {roomsPerFloor} - The amount of rooms per floor
 * @global {maxGuests} - The maximum amount of guests in a room
 * @global {roomTypes} - The types of rooms in the hotel
 * @global {globalState} - The global state of the program
 * @global {roomsResourceIdToObject} - Hash map for roomsInfo
 * @global {roomsIndexToResourceId} - Hash map for roomsInfo
 */

import dayjs from "dayjs";
import { bookingsInfo, loadRooms } from "./getInfo.js"; // Importing the bookings and rooms info

export {
    buildingFloors,
    roomsPerFloor,
    maxGuests,
    roomTypes,
    globalState,
    roomsResourceIdToObject,
    roomsIndexToResourceId,
} 

let globalState = {
    currentDay: dayjs('2025-01-01'),
    reset (){
        this.currentDay = dayjs('2025-01-01')
    }
}

// Array which will hold template of rooms.
let roomTypes = ["s1q0","s2q0","s0q1","s1q1","s0q2"]

// Room generation variables
let buildingFloors = 5; // Floors in the hotel.
let roomsPerFloor = 2; // Amount of rooms to generate for each floor.
let maxGuests = 4; // Maximum guests for the largest room (-1 because we add in the random generation in roomGenerator).    



/**
 * Hash map for roomsInfo, that converts from the resourceID 
 * to the room's object containing more detailed information.
 */

let { roomsInfo } = await loadRooms();
console.log("Loaded Rooms Info:", roomsInfo);

// Check if the result is an array
if (!Array.isArray(roomsInfo)) {
    throw new Error("loadRooms() did not return an array");
}

const roomsResourceIdToObject = roomsInfo.reduce((hash, room) => {
// Hash map for roomsInfo
    hash[room.roomNumber] = room;
    return hash;
}, {});

/**
 * Hash map for roomsInfo, that converts an index (from 0) to the resourceID of a room.
 */
const roomsIndexToResourceId = roomsInfo.reduce((hash, room, index) => {
    hash[index] = room;
    return hash;
}, {});