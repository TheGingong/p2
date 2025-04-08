import fs from 'fs/promises';

// Function to match bookings to rooms, reads and writes to JSON
async function matchBookingsToRooms() {
    // Defining paths to JSON files
    const roomsPath = "../json/rooms.json";
    const bookingsPath = "../json/bookings.json";

    try {
        // Reads from JSON files and checks for errors
        console.log("Reading bookings from:", bookingsPath);
        const bookingsRaw = await fs.readFile(bookingsPath, 'utf-8');
        console.log("Reading rooms from:", roomsPath);
        const roomsRaw = await fs.readFile(roomsPath, 'utf-8');

        if (!bookingsRaw.trim() || !roomsRaw.trim()) {
            console.error("Error: One or more files are empty.");
            return;
        }
        
        // Parses the JSON content 
        const bookings = JSON.parse(bookingsRaw);
        const rooms = JSON.parse(roomsRaw);

        console.log(`Loaded ${bookings.length} bookings from ${bookingsPath}`);
        console.log(`Loaded ${rooms.length} rooms from ${roomsPath}`);

        // Sort bookings by earliest enddate
        sortBookings(bookings);

        // Match bookings to rooms
        for (const booking of bookings) {
            booking.resourceIds = await assignResId(booking, rooms);
        }

        console.log("Writing updated bookings to:", bookingsPath);
        // Updating resourceIds in bookings, to the newly assigned rooms
        await fs.writeFile(bookingsPath, JSON.stringify(bookings, null, 2));
        console.log("Bookings updated successfully!");

    } catch (error) {
        console.error("Error updating bookings:", error);
    }
}

// Function that finds the best fit room, and returns its room number
async function assignResId(booking, rooms) {
    // Loop through
    for (const room of rooms) {
        if (booking.guestsNumber === room.roomGuests) {
            // Return room number or some other identifier
            return room.roomNumber;
        }
        else {
            continue;
        }
    }
    return null; // Return null if no room is found
}

function sortBookings(bookings){
    bookings.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
}

matchBookingsToRooms();
