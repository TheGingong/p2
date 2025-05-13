/**
 * This file contains the function and subfunctions for generating the hotel's bookings. 
 * createBookingBatch is the main function here, and ultimately returns an array containing all the generated bookings. 
 */

import fs from 'fs/promises'
import { extendGrid, bookingRange, availabilityGrid, dateDifference } from '../scripts/availabilityMatrix.js';
import { roomsInfo, loadBookings } from './getInfo.js';
import { generateRoomNumber, generateRoomTypes } from '../scripts/roomGenerator.js';
import dayjs from 'dayjs';
import { roomTypes } from './globalVariables.js';
export { storeBookings }

/**
 * @generator Creates batch of bookings, objects with information about the simulated bookings
 * @param {Integer} batch - Desired number of bookings to create
 */
function createBookingBatch(batch) {
    // Initialization of all the variables which will be needed for the code below. 
    let checkInMonth, checkInDate, stayDuration, checkOutDate, 
    currentBookingObject, guestsNumber, daysInMonth, 
    dayOfBooking, daysBeforeCheckIn, randomCheckInDay, preference;
    
    // Array which will hold booking objects.
    let bookingBatches = [];

    return new Promise((resolve, reject) => {
        try {
            for (let i = 1, j = 1; i <= batch; i++) {

                // Generates random number 1-12 to set a month for the booking.

                checkInMonth = Math.floor(Math.random() * 12);

                /** 
                 * Based on the month found above, the days in the month is found, 
                 * and then a random day is decided within the month. 
                 */
                daysInMonth = dayjs().year('2025').month(checkInMonth).daysInMonth();
                randomCheckInDay = Math.ceil(Math.random() * daysInMonth); // Generates a random number [0 - intervalLenth], and shifts nr of days in controlDate.
                
                // The checkInDate is set based on the month and day found in the two generations above. 
                checkInDate = dayjs().year('2025').month(checkInMonth).date(randomCheckInDay); 
               
                // A stayduratino is found, and the checkOutDate is found based on this. 
                stayDuration = Math.ceil((Math.random() * 8)) + 1;
                checkOutDate = checkInDate.add(stayDuration, 'day');
                
                /** 
                 * Generates the day that the booking was made, such that not all booknings are made the same day, 
                 * but rather any random day before the checkInDate (but at most 60 days before)
                 */
                daysBeforeCheckIn = Math.ceil(Math.random() * 60);
                dayOfBooking = checkInDate.subtract(daysBeforeCheckIn, 'day').format('YYYY-MM-DD');

                // The format of the dates is changed to match our programming, and how we may want to read the data. 
                checkInDate = checkInDate.format('YYYY-MM-DD');
                checkOutDate = checkOutDate.format('YYYY-MM-DD'); 
               
                // The amount of guests who will attend the generated booking is determined with a max value. 
                guestsNumber = Math.ceil(Math.random() * 4);

                // The 'preference' parameter of the booking object is initialized as an object within the booking object. 
                preference = {}

                // Room preferences are generated - WIP
                //generateRoomTypes(guestsNumber);

                switch(guestsNumber) {
                    case 1:
                        preference.beds = roomTypes[0]; // One single bed.
                        break;
                    case 2:
                        preference.beds = roomTypes[Math.ceil(Math.random() * 2)]; // 2 single beds or 1 queen bed.
                        break;
                    case 3:
                        preference.beds = roomTypes[3]; // One single bed and 1 queen bed. Correct? !!
                        break;
                    case 4:
                        preference.beds = roomTypes[4]; // One single bed and 1 queen bed. Correct? !!
                        break;
                    default:
                        console.log("Something went wrong. Too many guests.");
                }

                let chanceForFloorPref = Math.floor(Math.random() * 1); // Generates a number from 0 to the specified value.
                // Runs if chanceForFloorPref = 0.
                if (!chanceForFloorPref) {
                    preference.floor = Math.ceil(Math.random() * 5);
                }



                // lets the bookings have no roomNumber when generated

                let resourceIds = "0";

                let bookingId = i;

                // Appends the properties to the current booking object and pushes it into the array of booking batches.
                currentBookingObject = {checkInDate, checkOutDate, guestsNumber, stayDuration, dayOfBooking, resourceIds, bookingId, preference};
                bookingBatches.push(currentBookingObject);
            }    

            // creates the booking matrix with the length of the furthest booking
            // and the amount of rooms in the hotel

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
 * Function that generates the batches and places it inside a JSON file
 * @const data The data generated by the createBookingBatch function
 * @param {Integer} amountOfBookings - The amount of bookings to generate
 * @file {src/json/bookings.json} - The file where the data is stored
 * @returns {Object} Returns a message and the data generated
 */ 
async function storeBookings(amountOfBookings) {
    try {
        const data = await createBookingBatch(amountOfBookings);
        let jsonBookingBatches = JSON.stringify(data, null, 2);
        await fs.writeFile("src/json/bookings.json", jsonBookingBatches);
        await loadBookings(); // Loading bookings into array after its been written into bookings.json
        return { message: "Batch filled.", data };
    } catch (error) {
        return { error: "Batch generation failed." };
    }
}