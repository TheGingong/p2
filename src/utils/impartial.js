import fs from 'fs/promises'
import { extendGrid, bookingRange, availabilityGrid } from '../scripts/availabilityMatrix.js';
import { roomsInfo, loadBookings } from './getInfo.js';
import { generateRoomNumber } from '../scripts/roomGenerator.js';
import dayjs from 'dayjs';
import { roomTypes } from './globalVariables.js';
export { storeBatch365 }

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
                daysBeforeCheckIn = Math.ceil(Math.random() * 60);
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
                        preference.beds = roomTypes[0]; // One single bed
                        break;
                    case 2:
                        preference.beds = roomTypes[Math.ceil(Math.random() * 2)]; // 2 single bed or 1 queen bed
                        break;
                    case 3:
                        preference.beds = roomTypes[3]; // One single bed and 1 queen bed
                        break;
                    case 4:
                        preference.beds = roomTypes[4]; // One single bed and 1 queen bed
                        break;
                    default:
                        console.log("Something went wrong. Too many guests.");
                }

                let chanceForFloorPref = Math.floor(Math.random() * 20); // Generates a number from 0-19 (5% chance for 0)
                // Runs if chanceForFloorPref = 0
                if (!chanceForFloorPref) {
                    preference.floor = Math.ceil(Math.random() * 5);
                }

                // Needs to be deleted later
                let room = i % 11
                let resourceIds;
                if (room === 0){
                    j += 1
                    i++
                    //resourceIds = generateRoomNumber(j,room+1)
                } else {
                    //resourceIds = generateRoomNumber(j,room)
                }
                resourceIds = 0;

                // Appends the properties to the current booking object and pushes it into the array of booking batches
                currentBookingObject = {checkInDate, checkOutDate, guestsNumber, stayDuration, dayOfBooking, preference, resourceIds};
                bookingBatches.push(currentBookingObject);
            }    
            
            //let jsonBookingBatches = JSON.stringify(bookingBatches, null, 2);
            //console.log("before " + availabilityGrid);
            //console.log(bookingBatches)
            extendGrid(roomsInfo, bookingRange(bookingBatches));
            //console.log("after " + availabilityGrid);

            // Resolves if no errors and returns array of booking batches
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
        console.log(data);
        await sortByBooking(data);
        let jsonBookingBatches = JSON.stringify(data, null, 2);
        await fs.writeFile("src/json/bookings.json", jsonBookingBatches);
        await loadBookings(); // Loading bookings into array after its been written into bookings.json
        return { message: "Batch filled.", data };
    } catch (error) {
        return { error: "Batch generation failed." };
    }
}

async function sortByBooking(data){
    data.sort((a,b) =>{
        let bookingDiff = new Date(a.dayOfBooking) - new Date(b.dayOfBooking);
        if(bookingDiff === 0){
            let checkoutDiff = Date(a.checkOutDate) - Date(b.checkOutDate);
            if(checkoutDiff === 0){
                return b.stayDuration - a.stayDuration;
            } else return checkoutDiff;
        } else return bookingDiff
    })
}
