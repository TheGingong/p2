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

// calculate total rooms (regardless of floor)

readFile('roomTypes.json', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
    });