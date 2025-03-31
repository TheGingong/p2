import { readFile } from 'fs';

let floors = 5
let totalRooms = 100


readFile('roomTypes.json', 'utf8', (err, data) => { // Use 'utf8' encoding
    if (err) throw err;
    let roomData = JSON.parse(data); // Parse the JSON text into an object
    console.log(roomData); // Log the parsed object
    if (roomData.roomTypes && Array.isArray(roomData.roomTypes)) {
        totalRooms(roomData); // Pass the parsed object to totalRooms
    } else {
        console.error("Invalid data structure: roomTypes is missing or not an array.");
    }
});

function addRoom(){
    let newRoom  = 
}