import fs from 'fs/promises'
import { generateRoomNumber } from '../scripts/roomGenerator.js';
import { extendGrid, bookingRange, availabilityGrid } from '../scripts/availabilityMatrix.js';
import { roomsInfo, loadBookings } from './getInfo.js';
import dayjs from 'dayjs';
export { storeBatch365 }
import { roomtypes } from './globalVariables.js';

function createBookingBatch(batch) {
    let checkInMonth, checkInDate, stayDuration, checkOutDate, 
    currentBookingObject, guestsNumber, daysInMonth, 
    dayOfBooking, daysBeforeCheckIn, randomCheckInDay, preference;
    
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
                guestsNumber = Math.ceil(Math.random() * 4);

                // Initialize the preference object for current booking
                preference = {}

                // Generate room preference
                switch(guestsNumber) {
                    case 1:
                        preference.beds = roomtypes[0]; // One single bed
                        break;
                    case 2:
                        preference.beds = roomtypes[Math.ceil(Math.random() * 2)]; // 2 single bed or 1 queen bed
                        break;
                    case 3:
                        preference.beds = roomtypes[3]; // One single bed and 1 queen bed
                        break;
                    case 4:
                        preference.beds = roomtypes[4]; // One single bed and 1 queen bed
                        break;
                    default:
                        console.log("Something went wrong. Too many guests.");
                }

                if ((i % 20) === 0) {
                    preference.floor = Math.ceil(Math.random() * 5);
                }
                
                // Appends the properties to the current booking object and pushes it into the array of booking batches
                currentBookingObject = {checkInDate, checkOutDate, guestsNumber, stayDuration, dayOfBooking, preference};
                bookingBatches.push(currentBookingObject);
            }    
            // Resolves if no errors and returns array of booking batches
            // Creates JSON return from the array of objects bookingBatches
            //let jsonBookingBatches = JSON.stringify(bookingBatches, null, 2);

            console.log("before " + availabilityGrid);
            console.log(bookingBatches)
            extendGrid(roomsInfo, bookingRange(bookingBatches));
            console.log("after " + availabilityGrid);

            resolve(bookingBatches);
        } catch (error) {
            // Catches any errors there might be
            reject(error);
        }
    })
}

// Function that generates the batches and places it inside a JSON file
async function storeBatch365() {
    try {
        console.log("Calling promise");
        const data = await createBookingBatch(50);
        let jsonBookingBatches = JSON.stringify(data, null, 2);
        await fs.writeFile("src/json/bookings.json", jsonBookingBatches);
        await loadBookings(); // Loading bookings into array after its been written into bookings.json
        return { message: "Batch filled.", data };
    } catch (error) {
        return { error: "Batch generation failed." };
    }
}



