import fs from 'fs/promises'
import { generateRoomNumber } from '../scripts/roomGenerator.js';
export { storeBatch }

let counter = 0;
let monthCounter = 0;

function createBookingBatch(batch) {
    let checkOutYear, checkInMonth, checkOutMonth, checkInDay, checkOutDay, daysInMonth, 
    startDate, endDate, stayDuration, totalDays, isMonthOverflow, currentBookingObject, 
    preferences, guestsNumber, resourceIds;
    let bookingBatches = [];
    let currentDay = new Date();
    let currentMonth = (currentDay.getMonth() + 1) + monthCounter;
    let checkInYear = currentDay.getFullYear();
    let minDay = counter;
    
    return new Promise((resolve, reject) => {
        try {
            console.log(counter);
            let minDay = counter;
            for (let i = 1, j = 1; i < batch; i++) {
                // Needs to be revised to handle current date and upcoming days booking batches. (talk in the group on how you want to handle it)

                // Missing part that only allows check-out dates to be within three months

                checkInMonth = Math.floor((Math.random() * (12-currentMonth)) + currentMonth);
                daysInMonth = getDaysInMonth(checkInYear, checkInMonth);
                
                if (minDay > daysInMonth) {
                    // move to next month
                    minDay = 1; // set counter to 1
                    currentMonth++; // increment month
                    if (currentMonth > 12) {
                        currentMonth = 1;
                        checkInYear++;
                    }
                    daysInMonth = getDaysInMonth(checkInYear, currentMonth);
                }

                checkInDay = Math.floor(Math.random() * (daysInMonth - minDay + 1)) + minDay;
                stayDuration = Math.floor((Math.random() * 19) + 1);
                totalDays = checkInDay + stayDuration;
                isMonthOverflow = totalDays > daysInMonth;
        
                // Logic that checks for overflow in days, months and year. Assigns the correct check-out information.
                if (isMonthOverflow) {
                    checkOutDay = totalDays - daysInMonth;
                    checkOutMonth = checkInMonth === 12 ? 1 : checkInMonth + 1;
                    checkOutYear = checkInMonth === 12 ? checkInYear + 1 : checkInYear;
                } else {
                    checkOutMonth = checkInMonth;
                    checkOutYear = checkInYear;
                    checkOutDay = totalDays;
                }
                
                // Properties of the current booking object gets initialized
                startDate = `${checkInYear}-${String(checkInMonth).padStart(2, '0')}-${String(checkInDay).padStart(2, '0')}`;
                endDate = `${checkOutYear}-${String(checkOutMonth).padStart(2, '0')}-${String(checkOutDay).padStart(2, '0')}`;
                
                // Generating guests
                guestsNumber = Math.floor((Math.random() * 4) + 1);

                // Needs to be deleted later
                let room = i % 11
                if (room === 0){
                    j += 1
                    i++
                    resourceIds = generateRoomNumber(j,room+1)
                } else {
                    resourceIds = generateRoomNumber(j,room)
                }
                
                // Appends the properties to the current booking object and pushes it into the array of booking batches
                currentBookingObject = {startDate, endDate, guestsNumber, resourceIds, stayDuration};
                bookingBatches.push(currentBookingObject);

                
            } 
            minDay = checkInDay + 1;
            counter++;

            // Resolves if no errors and returns array of booking batches
            // Creates JSON return from the array of objects bookingBatches
            let jsonBookingBatches = JSON.stringify(bookingBatches, null, 2);
            resolve(jsonBookingBatches);
        } catch (error) {
            // Catches any errors there might be
            reject(error);
        }
    })
}

// Function that gets the amount of days in a specific month and year
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
  
// Function that generates the batches and places it inside a JSON file
async function storeBatch() {
    try {
        console.log("Calling promise");
        const data = await createBookingBatch(52);
        await fs.writeFile("src/json/bookings.json", data);
        return { message: "Batch filled.", data };
    } catch (error) {
        return { error: "Batch generation failed." };
    }
}
