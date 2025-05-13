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
    globalState,
    roomTypes,
    totalPrefs,
    prefOddsGuests,
    prefOddsRooms,
    roomsResourceIdToObject,
    roomsIndexToResourceId,
} 

let globalState = {
    currentDay: dayjs('2025-01-01'),
    reset (){
        this.currentDay = dayjs('2025-01-01')
    }
}

// Available room/booking preferences.
let roomTypes = ["s1q0","s2q0","s0q1","s1q1","s0q2"]; // Bed layouts/room types.
let totalPrefs = { // Object containing all the soft preference options.
    pref1  : ["opt1.1", "opt1.2", "opt1.3", "opt1.4", "opt1.5"],
    pref2  : ["opt2.1", "opt2.2", "opt2.3", "opt2.4", "opt2.5"],
    pref3  : ["opt3.1", "opt3.2", "opt3.3", "opt3.4", "opt3.5"],
    pref4  : ["opt4.1", "opt4.2", "opt4.3", "opt4.4", "opt4.5"],
    pref5  : ["opt5.1", "opt5.2", "opt5.3", "opt5.4", "opt5.5"],
    pref6  : ["opt6.1", "opt6.2", "opt6.3", "opt6.4", "opt6.5"],
    pref7  : ["opt7.1", "opt7.2", "opt7.3", "opt7.4", "opt7.5"],
    pref8  : ["opt8.1", "opt8.2", "opt8.3", "opt8.4", "opt8.5"],
    pref9  : ["opt9.1", "opt9.2", "opt9.3", "opt9.4", "opt9.5"],
    pref10 : ["opt10.1", "opt10.2", "opt10.3", "opt10.4", "opt10.5"]
};

// Global variable to change chances of preferences occuring. Probability will be 1/prefOdds.
let prefOddsGuests = 20; // ex. 20 => 1/20 = 5% chance
let prefOddsRooms = 4;

// Room generation variables: 
let buildingFloors = 4; // Floors in the hotel.
let roomsPerFloor = 2; // How many rooms to generate for every floor.
let maxGuests = 4; // Maximum guests for largest room (-1 because we add in the random generation).

/**
 * The following code makes a hash map for roomsInfo, 
 * converting the resourceID to the room's object containing more detailed information.
 */
let { roomsInfo } = await loadRooms();
console.log("Loaded Rooms Info:", roomsInfo);
// Checks if the result is an array.
if (!Array.isArray(roomsInfo)) {
    throw new Error("loadRooms() did not return an array");
}
// Converts the resource ID of a room, to it's object
const roomsResourceIdToObject = roomsInfo.reduce((hash, room) => {
    hash[room.roomNumber] = room;
    return hash;
}, {});
// Converts the room index of a room, to it's resource ID
const roomsIndexToResourceId = roomsInfo.reduce((hash, room, index) => {
    hash[index] = room;
    return hash;
}, {});