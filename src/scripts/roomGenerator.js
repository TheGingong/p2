import fs from 'fs/promises'
import { loadRooms } from '../utils/getInfo.js';
export {generateRoomNumber}
export {generateRooms}
export {generateGuests}

// variables
let buildingFloors = 5; // floors in the hotel
let roomsPerFloor = 10; // how many rooms to generate for every floor
let maxGuests = 5; // maximum guests for largest room (-1 because we add in the random)

// function that will generate all rooms using other functions, 
// and write them into the json file through an array
async function generateRooms () {
    // define file path for rooms.json file
    const roomsPath = 'src/json/rooms.json';

    // prepare to write a bunch of data 
    await fs.writeFile(roomsPath, "[\n", "utf8");

    // loop that makes rooms and inserts them into the array for a said amount of rooms per floor for each floor
    for (let i=1; i <= buildingFloors; i++){
        for (let j=1; j<= roomsPerFloor; j++) {
            console.log(`Room Number (${i}, ${j}):`, generateRoomNumber(i, j));
            let roomObject = {
                "roomNumber" : generateRoomNumber(i, j),
                "roomGuests" : generateGuests(maxGuests),
                "roomOcc" : 0
            };

            // convert to json string
            let roomData = JSON.stringify(roomObject, null, 2);

            // if not the first entry, add a comma for valid json
            if (i !== 1 || j !== 1) {
            roomData = ",\n" + roomData;
            }

            // Append data to the file
            await fs.appendFile(roomsPath, roomData, "utf8");
        }
    };
    await fs.appendFile(roomsPath, "\n]", "utf8");

    //loadRooms();
}

// function that generates a roomnumber s.t. ex "109" is room 9 in floor 1
function generateRoomNumber(roomFloor, roomNumber) {
    if (roomNumber<10) {return roomFloor.toString() +  "0" + roomNumber.toString()}
    else {return roomFloor.toString() + roomNumber.toString()};
}

// function that generates a random amount of guest space for a room
function generateGuests (maximumGuests) {
    return Math.floor((Math.random() * maximumGuests) + 1);
}

// run the function
//generateRooms();