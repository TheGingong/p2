/** 
 * a file for all the global variables that we use throughout the program files
 * These variables are meant to be changed and imported/exported multiple times.
 * Having them here is just to get a better overview of them instead of having to go through every file
 * 
 * This is also meant to store variables that we want to change to test the program like amount of rooms/guests and so on
**/

export {
    buildingFloors,
    roomsPerFloor,
    maxGuests,
    currentDay,
} // 


let currentDay = '2025-01-01';



// roomGeneration
let buildingFloors = 1; // floors in the hotel
let roomsPerFloor = 2; // how many rooms to generate for every floor
let maxGuests = 5; // maximum guests for largest room (-1 because we add in the random)