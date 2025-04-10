import fs from 'fs/promises';

async function matchBookingsToRooms() {   
    // Defining paths to JSON files
    const roomsPath = "../json/rooms.json";
    const bookingsPath = "../json/bookings.json";

    try {
        // Reads from JSON files and checks for errors
        const bookingsRaw = await fs.readFile(bookingsPath, 'utf-8');
        const roomsRaw = await fs.readFile(roomsPath, 'utf-8');

        if (!bookingsRaw.trim() || !roomsRaw.trim()) {
            console.error("Error: One or more files are empty.");
            return;
        }
        
        // Parses the JSON content 
        const allBookings = JSON.parse(bookingsRaw);
        const rooms = JSON.parse(roomsRaw);
        // Sort bookings by earliest enddate
        sortBookings(bookings);

        // Match bookings to rooms
        for (const booking of bookings) {
            booking.resourceIds = await assignResId(booking, rooms);
        }

        // Updating resourceIds in bookings, to the newly assigned rooms
        await fs.writeFile(bookingsPath, JSON.stringify(bookings, null, 2));
        await fs.writeFile(roomsPath, JSON.stringify(rooms, null, 2));

    } catch (error) {
        console.error("Error updating bookings:", error);
    }
}


// Function that finds the best fit room, and returns its room number
async function assignResId(booking, rooms) {
    // Loop through
    for (const room of rooms) {
        // Check occupation
        if (room.roomOcc === 1){
            continue;
        }
        if (booking.guestsNumber === room.roomGuests) {
            // Return room number or some other identifier
            room.roomOcc = 1;
            return room.roomNumber;
        }
        else {
            continue;
        }
    }
}

// Function for sorting the bookings
function sortBookings(bookings){
    bookings.sort((a,b) => {
        const endDiff = new Date(a.dayOfbooking) - new Date(b.dayOfBooking)
    })
}

function getBookingsAtDate(bookings,date){
    const visibleBookings = bookings.filter((booking) => bookings.dayOfBooking === date);
    return visibleBookings
}

matchBookingsToRooms();


