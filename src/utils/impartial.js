import fs from 'fs/promises'
import { generateRoomNumber } from '../scripts/roomGenerator.js';
import dayjs from 'dayjs';
import { loadBookings } from './getInfo.js';
export { storeBatch365 }


function createBookingBatch(batch) {
    let checkInMonth, checkInDate, stayDuration, checkOutDate, 
    currentBookingObject, floorPref, guestsNumber, resourceIds, daysInMonth, dayOfBooking,
    daysBeforeCheckIn, randomCheckInDay;
    
    // Array which will hold booking objects
    let bookingBatches = [];
    
    return new Promise((resolve, reject) => {
        try {
            for (let i = 1, j = 1; i < batch; i++) {
                checkInMonth = Math.floor(Math.random() * 12); // Generates random number 1-12
                daysInMonth = dayjs().year('2025').month(checkInMonth).daysInMonth();
                randomCheckInDay = Math.ceil(Math.random() * daysInMonth); // Generates a random number from [0 - intervalLenth], and shifts nr of days in controlDate
                checkInDate = dayjs().year('2025').month(checkInMonth).date(randomCheckInDay); 
                stayDuration = Math.ceil((Math.random() * 19));
                checkOutDate = checkInDate.add(stayDuration, 'day');
                
                // Generating day of booking
                daysBeforeCheckIn = Math.ceil(Math.random() * 30);
                dayOfBooking = checkInDate.subtract(daysBeforeCheckIn, 'day').format('YYYY-MM-DD');

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
                currentBookingObject = {checkInDate, checkOutDate, guestsNumber, resourceIds, stayDuration, dayOfBooking};
                bookingBatches.push(currentBookingObject);
            }
            
            // Resolves if no errors and returns array of booking batches
            // Creates JSON return from the array of objects bookingBatches
            resolve(bookingBatches);
        } catch (error) {
            // Catches any errors there might be
            reject(error);
        }
        loadBookings();
    })
}

// Function that generates the batches and places it inside a JSON file
async function storeBatch365() {
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