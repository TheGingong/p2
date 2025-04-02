import { readFile } from 'fs/promises';

let Rooms = null;
let Bookings = null;

async function loadData() {
    try {
        const roomsData = await readFile('src/json/rooms.json', 'utf8');
        const bookingsData = await readFile('src/json/bookings.json', 'utf8');

        Rooms = JSON.parse(roomsData);
        Bookings = JSON.parse(bookingsData);

    } catch (err) {
        console.error("Error reading files:", err);
    }
}

// Load data at startup
await loadData();

//console.log("Rooms Loaded:", Rooms);
//console.log("Bookings Loaded:", Bookings);
// Now, Rooms and Bookings will have data after loading

export { Rooms, Bookings };
