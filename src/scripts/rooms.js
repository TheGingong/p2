// - HARD PREFS -
// people (amount of sleeping spots)
// beds (types of bed)
// accesibility
// 
// - SOFT PREFS -
// floor?
// entertainment?
// 

import { readFile } from 'fs';

// reads json file, and allocates data in roomTypes object
//         directory,   parse-type,   callback

let buildingfloors = 5;
let total = 50;

fetch("/roomTypes.json")
    .then(response => response.json())
    .then(data => {
        // Ensure data has the expected structure
        if (data.roomTypes && Array.isArray(data.roomTypes)) {
            totalRooms(data); // Pass the data to totalRooms
        } else {
            console.error("Invalid data structure: roomTypes is missing or not an array.");
        }
    })
    .catch(err => console.log(err));

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

// calculate total rooms
function totalRooms(data) {
    for(let j in data.roomTypes) {
        for (let x = 0; x < buildingfloors; x++) { // Iterate over the range of floors
            if (!data.roomTypes[j].floors) {
                data.roomTypes[j].floors = []; // Initialize floors array if it doesn't exist
            }
            data.roomTypes[j].floors[x] = data.roomsTotal.single1Queen1 / buildingfloors; // Assign value to floors[x]
            console.log(data.roomTypes[j].floors[x]); // Log the value for debugging
        }
}
}
