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
readFile('roomTypes.json', 'utf8', (err, data) => {
    if (err) throw err;
    let roomData = data
    console.log(roomData);
    });

// calculate total rooms
function totalRooms () {
    for (let rooms in roomsData.roomsTotal) {
        //bomboclyatty
    }
}

// calculate total available rooms
