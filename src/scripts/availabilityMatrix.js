import { bookingsInfo, roomsInfo } from "../utils/getInfo.js";
import dayjs from "dayjs";
import { globalState } from "../utils/globalVariables.js"
export {
  extendGrid,
  bookingRange,
  availabilityGrid,
  insertBookings,
  checkAvailability,
  dateDifference,
  dateIndex,
  resetMatrix
};

let today = dayjs(globalState.currentDay); // Get today's date.

let availabilityGrid = {}; // Initializes globally available matrix.

let temp_min = today; // The last "last" booking. - explain !! - maybe change var name from temp !!

// BookingRange takes an array of bookings and finds the booking with the longest checkOutDate. This value is given to extendGrid.
function bookingRange(newBookings) {
  // temp_max is set to the new 'last' booking.
  let temp_max = temp_min;
  let range = 0;

  // If we have a new booking with a later end date, we set the range to be the differnce between the previous end date and the new one. 
  for (let i of newBookings) {
    if (dateIndex(i.checkOutDate) > dateIndex(temp_max)) {
      temp_max = i.checkOutDate;
    }
  }
  range = dateDifference(temp_min, temp_max);
  temp_min = temp_max;
  console.log(range);
  return range;
}

// Function that returns an index showing the difference from the given date to today as an int.
function dateIndex(date) {
  const futureDate = dayjs(date); // Convert string to dayjs.
  return futureDate.diff(today, "day");
}

// Function that returns the difference between 2 days as an int.
function dateDifference(date1, date2) {
  return dayjs(date2).diff(dayjs(date1), "day");
}

/**
 * Extends matrix for a given dataset with certain amount of rooms and the range of dates in the dataset.
 * @param {Array} rooms - Array of all rooms
 * @param {Integer} date_range - Number determined with bookingRange from first day to last booking
 */
function extendGrid(rooms, date_range) {
  if (date_range === 0) {
    console.log(availabilityGrid);
    console.log("date_range = 0");
    return;
  }
  console.log("date_range = " + date_range);
  let tempGrid = {};

  // If empty, create new grid and fill it with 0.
  if (Object.keys(availabilityGrid).length === 0) {
    rooms.forEach((room) => {
      availabilityGrid[room.roomNumber] = new Array(date_range).fill(0);
      console.log("grid empty, new grid created");
    });
  } else {
    // Makes temporary grid for the new matrix, which needs to be appended to the total grid.
    rooms.forEach((room) => {
      tempGrid[room.roomNumber] = new Array(date_range).fill(0);
    });
    console.log(tempGrid);

    //// Appends the temp grid to the total grid. - Delete? !!
    //roomsInfo.forEach((room) => {
    //  availabilityGrid[room.roomNumber].push(date_range.fill(0));
    //});

    // Appends the array from tempGrid to the corresponding array in availabilityGrid
    for (let roomNumber in tempGrid) {
      // The '...' (spread operator) pushes all elements in tempGrid individually, so we dont push the entire array as one element.
      availabilityGrid[roomNumber].push(...tempGrid[roomNumber]);
    }
  }

  // Console logs and shows the availability grid visually. 
  console.log("availabilityGrid");
  console.log(availabilityGrid);
}

/**
 * Takes an array of bookings and inserts it into the given grid (matrix).
 * @param {Array} newBookings - Array of booking objects
 * @param {Object} grid - A matrix
 * @returns {Object} grid - The updated matrix with inserted bookings
 */
function insertBookings(newBookings, grid) {
  // Initialize dates with forEach
  newBookings.forEach((booking) => {
    let startDate = new Date(booking.checkInDate);
    let endDate = new Date(booking.checkOutDate);
    let roomNumber = booking.resourceIds; // Room ID

    // Calculate the index in the array (days from today)
    let startIndex = parseInt(dateIndex(startDate));
    let endIndex = parseInt(dateIndex(endDate));

    
    if (!grid[roomNumber]) {
      //console.error(`Room number ${roomNumber} not found in grid.`);
      return;
    }

    // Fill the grid for the room
    grid[roomNumber][startIndex] = "s" + booking.bookingId;

    for (let i = startIndex+1; i < endIndex-1; i++) {
      grid[roomNumber][i] = booking.bookingId; // Mark as occupied
    }

    if (booking.stayDuration > 1) {
      grid[roomNumber][endIndex-1] = "e" + booking.bookingId;
    }


  });
  return grid;
}


/**
 * Checks availability for a given room and date, in a specific grid (either availabilityGrid or tempMatrix).
 * @param {String} room - Room number matching the index of the matrix
 * @param {String} date - Date of booking to check in matrix
 * @param {Object} grid - Matrix to be checked
 * @returns {Integer} - Returns 1 if the room is occupied, and 0 if the room is unnocipied. 
 */
function checkAvailability(room, date, grid) {
  const realDate = dayjs(date);

  if (dateIndex(realDate) < 0){
    return 1;
  }
  return grid[room][dateIndex(realDate)] !== 0 ? 1 : 0;
}


// Resets the matrix (avalibilityGrid) so new data can be input
function resetMatrix(){
  for (const key in availabilityGrid) { // Sets all fields of the matrix to 0
    for (let i = 0; i < availabilityGrid[key].length; i++) {
      availabilityGrid[key][i] = 0;
    }
  }
}

function createSlice(matrix, sliceStartDate, sliceEndDate) {
  console.log( `Copy ${matrix} from ${sliceStartDate}, to ${sliceEndDate}.` );
  const sliceMatrix = [];
  const sliceEndIndex = sliceEndDate + 1;
}