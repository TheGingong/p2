/**
 * This file contains functions and the like for generating the bookings' and rooms' preferences. 
 */

import { roomTypes, buildingFloors, totalPrefs } from './globalVariables.js'
export { generateSoftPrefs, generateRoomTypes }

/**
 * Function called with the array containing all preference options. 
 * The function will, with a chance defined in globalVariables.js, give a room/booking a preference. 
 * @param {array} prefsArray Array of arrays representing prefs whose elems are options
 * @param {object} prefObject Object that may hold preferences
 */
function generateSoftPrefs(prefObject, prefOdds, isBooking){
    // Check if the function rund for the generation of a booking, if so alloc floor pref based on odds. 
    if (isBooking) {
        // Given prefOdds, define the odds of getting a floor pref, then assign.
        let chanceForFloorPref = Math.floor(Math.random() * prefOdds);

        // If the chance calculation's result is = 0, we assign the pref. 
        if (!chanceForFloorPref) {
            // Generate floor pref options seperately, as it is defined based on building floors variable in globalVariables.
            let floors = [];
            for (let i = 1; i <= buildingFloors; i++){
                floors.push(i)
            }
            prefObject.floor = Math.ceil(Math.random() * buildingFloors);
        }
    }

    // Loop that iterates through all the possible preferences in the 
    for (let pref in totalPrefs) {
        let chanceForPref = Math.floor(Math.random() * prefOdds);

        // If chanceForPref = 0, turn current index of prefsArray into a pref for the passed object, 
        // and choose a random between the options.
        if (!chanceForPref) {
            prefObject[pref] = totalPrefs[pref][
                Math.floor(Math.random() * totalPrefs[pref].length)
            ];
        }
    }
}

/**
 * Function that generates the room preferences depending on amount of guests, through af switch case.
 * @param {int} numberOfGuests Amount of max guests for a room
 * @param {object} prefObject Object that may hold preferences
 */ 
function generateRoomTypes(numberOfGuests, prefObject, currentFloor) {
    // Generate room preference.
    console.log(prefObject)
    // Start by generating the floor which the room is on if it is a room to generate.
    if (currentFloor > 0){
        prefObject.floor = currentFloor
    }
    // Now generate bed layout.
    switch(numberOfGuests) {
        case 1:
            return prefObject.beds = roomTypes[0]; // One single bed.
        case 2:
            return prefObject.beds = roomTypes[Math.ceil(Math.random() * 2)]; // 2 single bed or 1 queen bed.
        case 3:
            return prefObject.beds = roomTypes[3]; // One single bed and 1 queen bed.
        case 4:
            return prefObject.beds = roomTypes[4]; // 2 queen beds.
        default:
            console.log("Something went wrong. Too many guests.");
    };
}
