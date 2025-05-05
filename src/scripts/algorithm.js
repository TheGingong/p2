//import { availabilityGrid, checkAvailability, insertBookings } from "./availabilityMatrix";
//import { globalState } from "../utils/globalVariables";

let ghostMatrixTwo = [
    ["e7", "s1", "1", "e1"],
    ["s5", "5", "5", "e5"],
    ["s9", "9", "e9", "0"],
    ["0", "0", "s12", "e12"],
    ["s16", "e16", "s18", "e18"],
    ["s13", "13", "13e", "0"],
    ["10", "10", "10", "e10"],
    ["0","0","0","0"],
    ["71","71","71","71"]
  ];

let visibleBookings = [
    {
      "checkInDate": "2025-02-19",
      "checkOutDate": "2025-02-28",
      "guestsNumber": 4,
      "stayDuration": 9,
      "dayOfBooking": "2025-01-10",
      "resourceIds": "103",
      "bookingId": "s5",
      "preference": {
        "beds": "s0q2"
      }
    },
    {
      "checkInDate": "2025-02-17",
      "checkOutDate": "2025-03-02",
      "guestsNumber": 1,
      "stayDuration": 13,
      "dayOfBooking": "2025-01-19",
      "resourceIds": "105",
      "bookingId": "s9",
      "preference": {
        "beds": "s1q0"
      }
    },
    {
      "checkInDate": "2025-02-26",
      "checkOutDate": "2025-03-15",
      "guestsNumber": 2,
      "stayDuration": 17,
      "dayOfBooking": "2025-01-23",
      "resourceIds": "101",
      "bookingId": "s16",
      "preference": {
        "beds": "s0q1"
      }
    },
    {
      "checkInDate": "2025-03-22",
      "checkOutDate": "2025-04-07",
      "guestsNumber": 3,
      "stayDuration": 16,
      "dayOfBooking": "2025-02-04",
      "resourceIds": "104",
      "bookingId": "s13",
      "preference": {
        "beds": "s1q1"
      }
  }
  ]

preferenceOptimization(visibleBookings, null)

// Main optimzation function, which will call on subfunctions to optimize hotel bookings according to certain variables
function preferenceOptimization(visibleBookings, leniency) {  
    // Create the ghost matrix consisting of the new bookings from occupancy and the empty spots
    //initGhostMatrix();

    // Finds bookings starting today and placing them in an array
    let bookingsStartingToday = findWholeBooking(ghostMatrixTwo, visibleBookings);

    // Function that prioritizes the order to allocate in
    //let prioritizedSwapList = prioritySwaps(bookingsStartingToday, visibleBookings);
    
    // Iterate through the bookings in the bookings starting today
    for (let booking of bookingsStartingToday) {
        for (let room = 0; room < ghostMatrixTwo.length; room++) {
            if (validSwaps(booking.bookingId, room, ghostMatrixTwo)) {
                console.log(`Booking ${booking.bookingId} can be swapped into room ${room}`);

                // Find the location/resourceId of where the booking it wants to swap with is located - get this from pinu

                // Call preference score function and collect indecies and scores in array - freddy und ich has been working on this
                


                // Start allocating based of prioritization array and preference scores - vic has been working on dis

                
            }
        }
    }
}

//const ghostMatrix = initGhostMatrix(visibleBookings);

// Function that inserts the visible bookings for today into a pliable 'ghost' matrix
function initGhostMatrix(visibleBookings) {
    let tempMatrix = availabilityGrid;
    insertBookings(visibleBookings, tempMatrix);
    console.log(tempMatrix);
    return tempMatrix;
}

// Function that evaluates bookings, and returns a true or a false of possible/valid swaps for a single input booking 
function validSwaps(bookingId, room, matrix) {
    let bookingDuration = 3;
    if (matrix[room][0].includes("s") || matrix[room][0] === "0") { 
        if (matrix[room][bookingDuration].includes("e") || matrix[room][bookingDuration] === "0") {
            // This is now a possible swap for this booking so return true
            return true;
        }
    }
    return false;
}

// Helper function to validSwaps
function findWholeBooking(ghostMatrix, visibleBookings) {
    const bookingMap = {};
    for (const booking of visibleBookings) {
        bookingMap[booking.bookingId] = booking;
    }

    const bookingsStartingToday = [];
  
    for (let row = 0; row < ghostMatrix.length; row++) {
        if (ghostMatrix[row][0].includes("s")) {
            bookingsStartingToday.push(ghostMatrix[row][0]);
        }
    }

    const fullBookings = bookingsStartingToday.map(id => bookingMap[id]).filter(Boolean);
    console.log(fullBookings);

    // Returns the bookings starting today
    return fullBookings;
}

// Prioritizes the bookings starting today, s.t. first booking is the booking we earn the most score from (least prefs)
function prioritySwaps(booksStarting2day) {
    // Sorts the bookgins starting today, with the following arrow-function
    booksStarting2day.sort((booking1,booking2) => {
        // If the two bookings are not of the same stayduration, sort them longest to shortest
        if (booking1.stayDuration !== booking2.stayDuration){
            return booking2.stayDuration - booking2.stayDuration
        }
        // Else, we sort them based on how many preferences the bookings have.
        // Least preferences come first (as a single one carries more weight here) 
        // followed by bookings with more preferences
        return Object.keys(booking1.preference).length - Object.keys(booking2.preference).length;
    })
}
