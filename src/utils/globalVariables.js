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
import { bookingsInfo, roomsInfo } from "./getInfo.js"; // Importing the bookings and rooms info
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

// Array which will hold template of rooms
let roomTypes = ["s1q0","s2q0","s0q1","s1q1","s0q2"]

// roomGeneration
let buildingFloors = 2; // floors in the hotel
let roomsPerFloor = 5; // how many rooms to generate for every floor
let maxGuests = 4; // maximum guests for largest room (-1 because we add in the random)

// Delete this later
let roomsInfoo = [
    {
        "roomNumber": "101",
        "roomGuests": 4,
        "preference": {
        "beds": "s0q2"
        }
    },
    {
        "roomNumber": "102",
        "roomGuests": 2,
        "preference": {
        "beds": "s1q0"
        }
    },
    {
        "roomNumber": "103",
        "roomGuests": 2,
        "preference": {
        "beds": "s0q1"
        }
    },
    {
        "roomNumber": "104",
        "roomGuests": 4,
        "preference": {
        "beds": "s0q2"
        }
    },
    {
        "roomNumber": "105",
        "roomGuests": 3,
        "preference": {
        "beds": "s2q0"
        }
    }
    ]


// Hash map for roomsInfo
const roomsResourceIdToObject = roomsInfoo.reduce((hash, room) => {
    hash[room.roomNumber] = room;
    return hash;
}, {});

// Hash map for roomsInfo
const roomsIndexToResourceId = roomsInfoo.reduce((hash, room, index) => {
    hash[index] = room;
    return hash;
}, {});