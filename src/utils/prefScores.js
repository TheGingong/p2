/**
 * The functions in this file are designed to, given a booking and a room, 
 * figure out how well the allocation accomodates the guest's preferences. 
 */
import { roomsResourceIdToObject } from "./globalVariables.js";
export { calculatePrefScore, calculatePrefScoreRandom }
export let prefScoreArrayBefore = [];

/**
 * The function loads the needed data, compares the booking and room, and returns the preference score. 
 * @param {Object} booking The object containing allt eh information on the given booking
 * @param {Integer} room The ID of a room
 * @returns {Float} Returns the preference score for that booking, for a single day. 
 */
async function calculatePrefScore(booking, room, test = null) {
    // Score is initialized to be 1, and may be scaled down afterwards
    let score = 1;
    
    // Load the object containing the data on the parsed room ID.
    let roomDetails;
    if (test == null) {
    roomDetails = roomsResourceIdToObject[room];
    } else {
          roomDetails = room;
    }
    // Load how many total preferences for the booking.
    const amountOfPreferences = Object.keys(booking.preference);

    /**
     * If-statement that gives a score of -2 if this preference is not met. 
     * This is a hard constraint, so it's important to make sure it can't swap.
     * This should never happen as this would not be a valid swap. This is an extra security meassure.
     */
    if (roomDetails.roomGuests != booking.guestsNumber) {
        score = -2;
    }

    // For each of the booking's preferences, check if they are equal to any preferences in the parsed room.
    for (let key of amountOfPreferences) {
        if (!roomDetails.preference.hasOwnProperty(key) || roomDetails.preference[key] !== booking.preference[key]) {
            score -= 1 / amountOfPreferences.length;
        }
    }
    return Math.round(score * 100) / 100;
}

/**
 * Much like calculatePRefScore, this function calculates the preference score for a booking in a room, 
 * but this function is designed for the alternative, random allocation. 
 * @param {Object} booking The object containing allt eh information on the given booking
 * @param {Integer} room The ID of a room
 * @returns {Float} Returns the preference score for that booking, for a single day. 
 */
async function calculatePrefScoreRandom(booking, room) {
    let score = 1;
    
    // Load the object containing the data on the parsed room ID.
    const roomDetails = roomsResourceIdToObject[room];
    
    // Load how many total preferences for the booking.
    const amountOfPreferences = Object.keys(booking.preference);

    //console.log("Booking:", booking);
    //console.log("Room:", room);

    // For each of the booking's preferences, check if they are equal to any preferences in the parsed room.
    for (let key of amountOfPreferences) {
        if (!roomDetails.preference.hasOwnProperty(key) || roomDetails.preference[key] !== booking.preference[key]) {
            score -= 1 / amountOfPreferences.length;
        }
    }

    // The scores are pushed to prefScoreArrayBefore, such that it contains all the prefscores for all the days. 
    for (let i = 0; i < booking.stayDuration; i++) {
        prefScoreArrayBefore.push(score);
    }

    return Math.round(score * 100) / 100;
}