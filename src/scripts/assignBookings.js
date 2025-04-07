import fs from 'fs/promises';

async function matchBookingsToRooms() {
    const roomsPath = "../json/rooms.json";
    const bookingsPath = "../json/bookings.json";

    try {
        console.log("Reading bookings from:", bookingsPath);
        const bookingsRaw = await fs.readFile(bookingsPath, 'utf-8');
        console.log("Reading rooms from:", roomsPath);
        const roomsRaw = await fs.readFile(roomsPath, 'utf-8');

        const bookings = JSON.parse(bookingsRaw);
        const rooms = JSON.parse(roomsRaw);

        console.log(`Loaded ${bookings.length} bookings from ${bookingsPath}`);
        console.log(`Loaded ${rooms.length} rooms from ${roomsPath}`);

        // Update the stayDuration for each booking
        for (const booking of bookings) {
            booking.resourceIds = 200;
        }

        console.log("Writing updated bookings to:", bookingsPath);
        await fs.writeFile(bookingsPath, JSON.stringify(bookings, null, 2));
        console.log("Bookings updated successfully!");

    } catch (error) {
        console.error("Error updating bookings:", error);
    }
}
//hej
matchBookingsToRooms();