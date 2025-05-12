/**
 * The functions in this file are designed to, given a booking and a room, 
 * figure out how well the allocation accomodates the guest's preferences. 
 */

import { roomsResourceIdToObject } from "./globalVariables.js";
export { calculatePrefScore }

/**
 * The function loads the needed data, compares the booking and room, and returnd the preference score. 
 */
async function calculatePrefScore(booking, room) {
    let score = 1 * booking.stayDuration;
    
    // Load the object containing the data on the parsed room ID.
    const roomDetails = roomsResourceIdToObject[room];
    
    // Load how many total preferences for the booking.
    const amountOfPreferences = Object.keys(booking.preference);

    // If statement that gives a score of -2 if this preference is not met. This is a hard constraint so its important to make sure it can't swap.
    if (roomDetails.roomGuests != booking.guestsNumber) {
        score = -2;
    }

    // For every preference, we check if they are equal to any preferences in the room.j
    for (let key of amountOfPreferences) {
        if (!roomDetails.preference.hasOwnProperty(key) || roomDetails.preference[key] !== booking.preference[key]) {
            score -= 1 / amountOfPreferences.length;
        }
    }

    // If the booking is at its the original room calculate the score being 0. This makes it so it chooses its original room over a room with a worse score.
    if (roomDetails.roomNumber == booking.resourceIds) {
        score = 0.5;
    }

    /** 
     * The resulting preference score for the guest is multiplied by how many days the guest is staying, 
     * and thus has said preference score. The result is console logged and returned. 
     */ 
    return score;
}