/**
 * The functions in this file are designed to, given a booking and a room, 
 * figure out how well the allocation accomodates the guest's preferences. 
 */

import { roomsResourceIdToObject } from "./globalVariables.js";
export { calculatePrefScore }

// DELETE THIS MBY
/**
 * 
 */
async function scoringtwo(bookingsInfo, roomsInfo) {
    // Create a hash table for roomsInfo
    const roomsResourceIdToObject = roomsInfo.reduce((hash, room) => {
        hash[room.roomNumber] = room;
        return hash;
    }, {});

    let sumOfScores = 0;

    // 
    for (let assignment of bookingsInfo) {
        let score = 1;
        const roomDetails = roomsResourceIdToObject[assignment.resourceIds];
        if (roomDetails) { // If the resourceId exists in the hash table
            // Check if roomGuests match guestsNumber
            if (roomDetails.preference.beds != assignment.preference.beds) {
                score -= 0.5;
            }
            if (assignment.preference.hasOwnProperty('floor') && assignment.preference.floor != roomDetails.preference.floor) {
                score -= 0.5;
            }

            sumOfScores += score;

        } else {
            console.log(`Room ${assignment.resourceIds} not found in roomsInfo`);
        }
    }
    console.log("Average score is", sumOfScores / bookingsInfo.length);
}

/**
 * The function loads the needed data, compares the booking and room, and returnd the preference score. 
 */
async function calculatePrefScore(booking, room) {
    let score = 1;
    // Load the object containing the data on the parsed room ID.
    const roomDetails = roomsResourceIdToObject[room];
    // Load how many total preferences for the booking.
    const amountOfPreferences = Object.keys(booking.preference);

    // For every preference, we check if they are equal to any preferences in the room.
    for (let key of amountOfPreferences) {
        if (!roomDetails.preference.hasOwnProperty(key) || roomDetails.preference[key] !== booking.preference[key]) {
            score -= 1 / amountOfPreferences.length;
        }
    }

    /** 
     * The resulting preference score for the guest is multiplied by how many days the guest is staying, 
     * and thus has said preference score. The result is console logged and returned. 
     */ 
    console.log(score, "*", booking.stayDuration)
    console.log(score * booking.stayDuration)
    return score * booking.stayDuration;
}

// - test - 

let visibleBookings = [
    {
      "checkInDate": "2025-02-19",
      "checkOutDate": "2025-02-28",
      "guestsNumber": 4,
      "stayDuration": 9,
      "dayOfBooking": "2025-01-10",
      "resourceIds": "103",
      "bookingId": "s5",
      "preference": {
        "beds": "s0q2",
        "pref1": "1",
        "pref2": "2",
        "pref3": "3",
      }
    }
]
calculatePrefScore(visibleBookings[0], "101")