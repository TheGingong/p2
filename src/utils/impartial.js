import fs from 'fs/promises'
import { generateRoomNumber } from '../scripts/roomGenerator.js';
import dayjs from 'dayjs';
export { storeBatch, storeBatch365 }

// controlDate, lets us shift the earlist possible checkinDate
let controlDate = dayjs().year('2025').month(0).date(1);

function createBookingBatch(batch) {
    let checkInMonth, randomDateInterval, checkInDate, stayDuration, checkOutDate, 
    currentBookingObject, floorPref, guestsNumber, resourceIds;
    
    // Array which will hold booking objects
    let bookingBatches = [];
    
    // Change the length of the interval in which the checkInDates can be within
    let intervalLength = 8;
    
    return new Promise((resolve, reject) => {
        try {
            for (let i = 1, j = 1; i < batch; i++) {
                checkInMonth = controlDate.month();
                randomDateInterval = Math.floor((Math.random() * intervalLength) + controlDate.date()); // Generates a random number from [0 - intervalLenth], and shifts nr of days in controlDate
                checkInDate = dayjs().year('2025').month(checkInMonth).date(randomDateInterval); 
                stayDuration = Math.ceil((Math.random() * 19));
                checkOutDate = checkInDate.add(stayDuration, 'day');

                // Correct the format
                checkInDate = checkInDate.format('YYYY-MM-DD');
                checkOutDate = checkOutDate.format('YYYY-MM-DD'); 
               
                // Generating guests
                guestsNumber = Math.ceil(Math.random() * 5);

                // Needs to be deleted later
                let room = i % 11;
                if (room === 0){
                    j += 1;
                    i++;
                    resourceIds = generateRoomNumber(j,room+1);
                } else {
                    resourceIds = generateRoomNumber(j,room);
                }

                // Generate floor preference
                floorPref = Math.ceil(Math.random() * 5);
                
                // Appends the properties to the current booking object and pushes it into the array of booking batches
                currentBookingObject = {checkInDate, checkOutDate, guestsNumber, resourceIds, stayDuration};
                bookingBatches.push(currentBookingObject);
            } 
            //Shifts control month by 1 day
            controlDate = controlDate.add(1, 'day');
            
            // Resolves if no errors and returns array of booking batches
            // Creates JSON return from the array of objects bookingBatches
            resolve(bookingBatches);
        } catch (error) {
            // Catches any errors there might be
            reject(error);
        }
    })
}

// Function that generates the batches and places it inside a JSON file
async function storeBatch() {
    try {
        console.log("Calling promise");
        const data = await createBookingBatch(50);
        let jsonBookingBatches = JSON.stringify(data, null, 2);
        await fs.writeFile("src/json/bookings.json", jsonBookingBatches);
        return { message: "Batch filled.", data };
    } catch (error) {
        return { error: "Batch generation failed." };
    }
}

// Function that works exactly as the one above just creating an array of arrays containing objects and creating for the whole year
async function storeBatch365() {
    try {
        // Array containing arrays of booking objects
        let allBookings = [];
        console.log("Calling promise");
        for (let i = 0; i < 365; i++) {
            const data = await createBookingBatch(5);
            allBookings.push(data)
        }
        await fs.writeFile("src/json/bookings365.json", JSON.stringify(allBookings, null, 2));
        return { message: "Batch filled."};
    } catch (error) {
        return { error: "Batch generation failed." };
    }
}