import fs from 'fs'

function createBookingBatch(batch) {
    let checkOutYear, checkInMonth, checkOutMonth, checkInDay, checkOutDay, daysInMonth, startDate, endDate, stayDuration, totalDays, isMonthOverflow, currentBookingObject, preferences, resourceIds;
    let bookingBatches = [];
    let currentDay = new Date();
    let checkInYear = currentDay.getFullYear();
    
    return new Promise((resolve, reject) => {
        try {
            for (let i = 0; i < batch; i++) {
                // Needs to be revised to handle current date and upcoming days booking batches. (talk in the group on how you want to handle it)
                checkInMonth = Math.floor((Math.random() * 12) + 1);
                daysInMonth = getDaysInMonth(checkInYear, checkInMonth);
                checkInDay = Math.floor((Math.random() * daysInMonth) + 1);
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
                
                // Needs to be deleted later
                resourceIds = i

                // Appends the properties to the current booking object and pushes it into the array of booking batches
                currentBookingObject = {startDate, endDate, resourceIds, preferences, stayDuration};
                bookingBatches.push(currentBookingObject);
            } 

            // Resolves if no errors and returns array of booking batches
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
  
// Example function!! Simulates a function used in e.g. a button (next batch)
async function writeJSON() {
    try {
        let data = [];
        console.log("Calling promise");
        data = await createBookingBatch(20);
        fs.writeFile("../json/bookings.json", data, (err)=>{
            if (err){
                console.error(err);
                return;
            }
            console.log("File written successfully")
            })
        
    } catch (error) {
        console.error("You got an error:", error);
    }
}

writeJSON();

// This will run before the data is received from createBookingBatch
console.log("Testing async");