import { roomsResourceIdToObject } from "./globalVariables.js";
export { calculatePrefScore }

// DELETE THIS MBY
async function scoringtwo(bookingsInfo, roomsInfo) {
    // Create a hash table for roomsInfo
    const roomsResourceIdToObject = roomsInfo.reduce((hash, room) => {
        hash[room.roomNumber] = room;
        return hash;
    }, {});

    let sumOfScores = 0;

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

async function calculatePrefScore(booking, room) {
    let score = 1;

    const roomDetails = roomsResourceIdToObject[room];

    const amountOfPreferences = Object.keys(booking.preference);
    for (let key of amountOfPreferences) {
        // Check if preferences are equal to preferences in the room
        if (!roomDetails.preference.hasOwnProperty(key) || roomDetails.preference[key] !== booking.preference[key]) {
            score -= 1 / amountOfPreferences.length;
        }
    }
    console.log(score, "*", booking.stayDuration)
    console.log(score * booking.stayDuration)
    return score * booking.stayDuration;
}

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