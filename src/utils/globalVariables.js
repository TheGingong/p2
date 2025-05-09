/** 
 * This is a file for all the global variables that we use throughout the program files.
 * These variables are meant to be changed and imported/exported multiple times.
 * Having them here is just to get a better overview of them instead of having to go through each individual file where they may be used.
 * 
 * This is also meant to store variables that we want to change to test the program, such as the amount of rooms/guests, etc.
 */

import dayjs from "dayjs";
import { loadRooms } from "./getInfo.js";
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