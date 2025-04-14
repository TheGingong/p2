export { scoring }

async function scoring(bookingsInfo, roomsInfo) {
    // Create a hash table for roomsInfo
    const roomsHashTable = roomsInfo.reduce((hash, room) => {
        hash[room.roomNumber] = room;
        return hash;
    }, {});

    let score = 0;

    for (let assignment of bookingsInfo) {
        const roomDetails = roomsHashTable[assignment.resourceIds];
        if (roomDetails) { // If the resourceId exists in the hash table
            // Check if roomGuests match guestsNumber
            if (roomDetails.roomGuests === assignment.guestsNumber) {
                score += 1;
            }
        } else {
            console.log(`Room ${assignment.resourceIds} not found in roomsInfo`);
        }
    }

    console.log("Average score is", score / 50);
}