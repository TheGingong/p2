/** 
 * a file for all the global variables that we use throughout the program files
 * These variables are meant to be changed and imported/exported multiple times.
 * Having them here is just to get a better overview of them instead of having to go through every file
 * 
 * This is also meant to store variables that we want to change to test the program like amount of rooms/guests and so on
**/
import dayjs from "dayjs";

export {
    buildingFloors,
    roomsPerFloor,
    maxGuests,
    globalState,
    roomTypes,
} 
let globalState = {
    currentDay: dayjs('2025-01-01')
}

// Array which will hold template of rooms
let roomTypes = ["s1q0","s2q0","s0q1","s1q1","s0q2"]

// roomGeneration
let buildingFloors = 1; // floors in the hotel
let roomsPerFloor = 5; // how many rooms to generate for every floor
let maxGuests = 4; // maximum guests for largest room (-1 because we add in the random)