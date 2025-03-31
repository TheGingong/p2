import { readFile } from 'fs';



readFile("/src/json/rooms.json", 'utf8', (err, data) => { // Use 'utf8' encoding
    if (err) throw err;
    let roomData = JSON.parse(data); // Parse the JSON text into an object
    console.log(roomData); // Log the parsed object
});


readFile("/src/json/rooms.json", 'utf8', (err, data) => { // Use 'utf8' encoding
    if (err) throw err;
    let roomData = JSON.parse(data); // Parse the JSON text into an object
    console.log(roomData); // Log the parsed object
});