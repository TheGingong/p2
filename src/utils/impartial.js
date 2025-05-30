/**
 * This file contains the function and subfunctions for generating the hotel's bookings. 
 * createBookingBatch is the main function here, and ultimately returns an array containing all the generated bookings.
 */
import fs from 'fs/promises'
import dayjs from 'dayjs';
import { extendGrid, bookingRange } from '../scripts/availabilityMatrix.js';
import { roomsInfo, loadBookings } from './getInfo.js';
import { prefOddsGuests } from './globalVariables.js';
import { generateSoftPrefs, generateRoomTypes } from './preferences.js';
export { storeBookings }

/**
 * Function that creates batch of bookings, consisting of objects with information about the simulated bookings.
 * @param {Integer} batch - Desired number of bookings to create.
 * @returns {Array} bookingBatches - Array of all generated booking objects. 
 */
function createBookingBatch(batch) {
    // Initialization of all the variables which will be needed for the code below. 
    let checkInMonth, checkInDate, stayDuration, checkOutDate, 
    currentBookingObject, guestsNumber, daysInMonth, 
    dayOfBooking, daysBeforeCheckIn, randomCheckInDay, preference;
    
    // Array which will hold booking objects.
    let bookingBatches = [];

    // Makes promise that resolves when bookings are generated and returned.
    return new Promise((resolve, reject) => {
        try {
            for (let i = 1; i <= batch; i++) {
                // Generates random number in range 1-12 to set a month for the booking.
                checkInMonth = Math.floor(Math.random() * 12);

                /** 
                 * Based on the month found above, the days in the month is found, 
                 * and then a random day is decided within the month. 
                 */
                daysInMonth = dayjs().year('2025').month(checkInMonth).daysInMonth();
                randomCheckInDay = Math.ceil(Math.random() * daysInMonth); // Generates a random number [0 - intervalLenth], and shifts nr of days in controlDate.
                
                // The checkInDate is set based on the month and day found in the two generations above. 
                checkInDate = dayjs().year('2025').month(checkInMonth).date(randomCheckInDay); 
               
                // A stayduration is found and the checkOutDate is found based on this. 
                stayDuration = Math.ceil((Math.random() * 8)) + 1;
                checkOutDate = checkInDate.add(stayDuration, 'day');
                
                /** 
                 * Generates the day that the booking was made, to ensure they are not all made the same day, 
                 * but rather any random day before the checkInDate (but at most 60 days before).
                 */
                daysBeforeCheckIn = Math.ceil(Math.random() * 60);
                dayOfBooking = checkInDate.subtract(daysBeforeCheckIn, 'day').format('YYYY-MM-DD');

                // The format of the dates is changed to match our programming and how we want to read the data. 
                checkInDate = checkInDate.format('YYYY-MM-DD');
                checkOutDate = checkOutDate.format('YYYY-MM-DD'); 
               
                // The amount of guests who will attend the generated booking is determined with a max value. 
                guestsNumber = Math.ceil(Math.random() * 4);

                // The 'preference' parameter of the booking object is initialized as an object within the booking object. 
                preference = {};

                // Room type preferences are generated, followed by the generation of additional preferences. 
                generateRoomTypes(guestsNumber, preference,0);
                generateSoftPrefs(preference, prefOddsGuests, 1);
                
                // Initialize the bookings room number as "0" initially.
                let resourceIds = "0";

                // Gives the booking an ID number, simply based on the i-value, used to differentiate them
                let bookingId = i;

                // Appends the properties to the current booking object and pushes it into the array of booking batches.
                currentBookingObject = {checkInDate, checkOutDate, guestsNumber, stayDuration, dayOfBooking, resourceIds, bookingId, preference};
                bookingBatches.push(currentBookingObject);
            }    

            /**
             * Creates the booking matrix with the length of the furthest booking
             * and the amount of rooms in the hotel
             */
            extendGrid(roomsInfo, bookingRange(bookingBatches));

            // Resolves if there are no errors, and returns an array of booking batches.
            resolve(bookingBatches);
        } catch (error) {
            // Catches any errors that might occur. 
            reject(error);
        }
    })
}

/**
 * Function that generates the batches and places it inside a JSON file.
 * @param {Integer} amountOfBookings - The amount of bookings to generate.
 * @returns {Object} data - Returns a message and the data generated.
 */ 
async function storeBookings(amountOfBookings) {
    try {
        // Save array of bookings in 'data'
        const data = await createBookingBatch(amountOfBookings);
        // JSON.stringify and write to file, to store data in JSON
        let jsonBookingBatches = JSON.stringify(data, null, 2);
        await fs.writeFile("src/json/bookings.json", jsonBookingBatches);
        await loadBookings(); // Loading bookings into array after its been written into bookings.json
        console.log("Bookings loaded.")
        return { message: "Batch filled.", data };
    } catch (error) {
        return { error: "Batch generation failed." };
    }
}