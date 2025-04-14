export { scoring }

async function scoring(bookingsInfo, roomsInfo) {
    // Create a hash table for roomsInfo
    const roomsHashTable = roomsInfo.reduce((hash, room) => {
        hash[room.roomNumber] = room;
        return hash;
    }, {});

    let sumOfScores = 0;

    for (let assignment of bookingsInfo) {
        let score = 1;
        const roomDetails = roomsHashTable[assignment.resourceIds];
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