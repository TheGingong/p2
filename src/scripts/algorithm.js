import { availabilityGrid, checkAvailability, insertBookings } from "./availabilityMatrix";
import { globalState } from "../utils/globalVariables";

const ghostMatrix = initGhostMatrix(visibleBookings);

// Function that inserts the visible bookings for today into a pliable 'ghost' matrix
function initGhostMatrix(visibleBookings) {
    let tempMatrix = availabilityGrid;
    insertBookings(visibleBookings, tempMatrix);
    console.log(tempMatrix);
    return tempMatrix;
}


// Function that evaluates bookings, and returns an array of possible/valid swaps for a single input booking 
function validSwaps(booking, checkRoom, ghostMatrix) {
    let arrayHoldingIndexes = [];

    // Has the same start date as t
    if (booking.startDate === checkRoom.startDate)

}

// Main optimzation function, which will call on subfunctions to optimize hotel bookings according to certain variables
function preferenceOptimization(visibleBookings, leniency) {    

    



    for (booking of bookingsToday) {
        for (let i = 0; i <= bookingsToday; i++) {
            if (Math.abs(booking.stayDuration - bookingsToday[i].stayDuration) <= leniency) { // First constraint, checks for stayDuration
                if (checkAvailability(bookingsToday[i].resourceId, globalState.currentDay, tempMatrix) !== 0 && bookingsToday[i].stayDuration <= booking.stayDuration) { // Second constraint, does overlap happen?
                    // If statement goes through means that the booking its checking with, starts at the same 
                }
            }
        }
    }
}



// NOT NEEDED FOR NOW
// function that ...
function bookingsToday() {
    // Array that will consist of bookings that start today
    let bookingsToday = [];

    // Fill finalArray with the right bookings
    visibleBookings.forEach(booking => {
        if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')) {
            bookingsToday.push(booking);
        }
    })

}