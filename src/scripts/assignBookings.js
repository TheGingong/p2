import fs from 'fs/promises';

async function matchBookingsToRooms() {
    const roomsPath = "../json/rooms.json";
    const bookingsPath = "../json/bookings.json";

    try {
        console.log("Reading bookings from:", bookingsPath);
        const bookingsRaw = await fs.readFile(bookingsPath, 'utf-8');
        console.log("Reading rooms from:", roomsPath);
        const roomsRaw = await fs.readFile(roomsPath, 'utf-8');

        // Check if files are empty or invalid
        if (!bookingsRaw.trim() || !roomsRaw.trim()) {
            console.error("Error: One or more files are empty.");
            return;
        }

        const bookings = JSON.parse(bookingsRaw);
        const rooms = JSON.parse(roomsRaw);

        console.log(`Loaded ${bookings.length} bookings from ${bookingsPath}`);
        console.log(`Loaded ${rooms.length} rooms from ${roomsPath}`);

        sortBookings(bookings);
        // Match bookings to rooms
        for (const booking of bookings) {
            booking.resourceIds = await assignResId(booking, rooms);
        }

        console.log("Writing updated bookings to:", bookingsPath);
        await fs.writeFile(bookingsPath, JSON.stringify(bookings, null, 2));
        console.log("Bookings updated successfully!");

    } catch (error) {
        console.error("Error updating bookings:", error);
    }
}

async function assignResId(booking, rooms) {
    // Loop through the rooms and check availability
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
