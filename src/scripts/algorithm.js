import { availabilityGrid, checkAvailability, insertBookings } from "./availabilityMatrix";
import { globalState } from "../utils/globalVariables";

// Input visible bookings!!¨

const ghostMatrix = initGhostMatrix(visibleBookings);

function initGhostMatrix(visibleBookings) {
    let tempMatrix = availabilityGrid;
    insertBookings(visibleBookings, tempMatrix);
    return tempMatrix;
}

function validSwaps(bookingId, ghostMatrix) {

    

}

function ()


// Array that will consist of bookings that start today
let bookingsToday = [];

// Fill finalArray with the right bookings
visibleBookings.forEach(booking => {
    if (dayjs(booking.checkInDate).isSame(globalState.currentDay, 'day')) {
        bookingsToday.push(booking);
    }
})

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