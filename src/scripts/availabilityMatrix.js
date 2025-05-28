/**
 * This file contains how we handle the main data structure for keeping track of bookings and looking up in the bookings.
 * The file includes functions for inserting bookings, extending the availability grid (matrix) and resetting it.
 */
import dayjs from "dayjs";
import { globalState } from "../utils/globalVariables.js";
export { extendGrid, bookingRange, availabilityGrid, insertBookings, 
checkAvailability, dateDifference, dateIndex, resetMatrix, clearMatrix };

// Get today's date.
let today = dayjs(globalState.currentDay); 
// Initializes globally available matrix.
let availabilityGrid = {}; 
// The matrix starts at the date of today (1 January).
let firstDay = today; 

/**
 * Function that takes an array of bookings and finds the booking with the longest checkOutDate. 
 * This value is given to extendGrid, which will define the length of the matrix.
 * @param {Array} newBookings - Array of created bookings.
 * @returns {Integer} The range from today till last booking's end date.
 */
function bookingRange(newBookings) {
  let lastDay = firstDay; // 
  for (const booking of newBookings) {
    const dateChecked = dayjs(booking.checkOutDate);
    if (dateChecked.isAfter(lastDay)) {
      lastDay = dateChecked;
    }
  }
  // Compute the day-difference from first day till last.
  const range = lastDay.diff(firstDay, "day");
  // Update firstDay to the new latest date (still a Day.js), allowing to simulate more badges.
  firstDay = lastDay;
  return range;
}

/**
 * Function that returns an index showing the difference from the given date to today as an int.
 * @param {String} date - 
 * @returns {Integer} The difference between today and a date in the furture.
 */
function dateIndex(date) {
	const futureDate = dayjs(date); // Convert string to dayjs.
	return futureDate.diff(today, "day"); // dayjs built in diff function, finding difference between two strings
}

/**
 * Function that returns the difference between 2 days as an int.
 * @param {String} date1 
 * @param {String} date2
 * @returns {Integer} The difference between the two input dates.
 */
function dateDifference(date1, date2) {
	return dayjs(date2).diff(dayjs(date1), "day");
}

/**
 * Extends matrix for a given dataset with certain amount of rooms and the range of dates in the dataset.
 * @param {Array} rooms - Array of all rooms
 * @param {Integer} dateRange - Number determined with bookingRange from first day to last booking
 */
function extendGrid(rooms, dateRange) {
	/* If the range is 0, the matrix is empty (something went wrong),
	or new bookings are in same interval */
	if (dateRange === 0) {
		return;
	}
	console.log("dateRange = " + dateRange);
	let tempGrid = {};

	// If empty, create new grid for each room with an array with length 'range'.
	if (Object.keys(availabilityGrid).length === 0) {
		rooms.forEach((room) => {
			availabilityGrid[room.roomNumber] = new Array( // New array corresponding to room number.
				dateRange
			).fill(0); // Fill with zeros initially.	
		});
		console.log("Grid empty, new grid created.");
	} else {
		/* Makes temporary grid for the new matrix, which needs to be appended to the total grid,
		happens if the matrix is already been used, ensuring no mistakes. */
		rooms.forEach((room) => {
			tempGrid[room.roomNumber] = new Array(
				dateRange
			).fill(0);
		});

		// Appends the array from tempGrid to the corresponding array in availabilityGrid.
		for (let roomNumber in tempGrid) {
			// The '...' (spread operator) pushes all elements in tempGrid individually, so we dont push the entire array as one element.
			availabilityGrid[roomNumber].push(
				...tempGrid[roomNumber]
			);
		}
	}
}

/**
 * Takes an array of bookings and inserts it into the given grid (matrix).
 * @param {Array} newBookings - Array of booking objects
 * @param {Object} grid - A matrix
 * @returns {Object} grid - The updated matrix with inserted bookings
 */
function insertBookings(newBookings, grid) {
	// For each booking, assign values of the room
	newBookings.forEach((booking) => {
		let startDate = new Date(booking.checkInDate);
		let endDate = new Date(booking.checkOutDate);
		let roomNumber = booking.resourceIds; // Room ID.

		// Calculate the index in the array (days from today).
		let startIndex = parseInt(dateIndex(startDate));
		let endIndex = parseInt(dateIndex(endDate));

		// If room number doesn't exist in grid, error.
		if (!grid[roomNumber]) {
			//console.error(`Room number ${roomNumber} not found in grid.`);
			return;
		}

		// Fill the grid for the room, on starting date add 's', signaling start.
		grid[roomNumber][startIndex] = "s" + booking.bookingId;

		for (let i = startIndex + 1; i < endIndex - 1; i++) { // Fill all entries between start and end.
			grid[roomNumber][i] = booking.bookingId; // Mark as occupied.
		}

		if (booking.stayDuration > 1) {
			grid[roomNumber][endIndex - 1] =
				"e" + booking.bookingId; // Last day of booking get 'e', marking end.
		}
	});
	return grid;
}

/**
 * Checks the availability of a room on a given date.
 * @param {Object} room - Room to be checked for availability.
 * @param {String} date - Date to be checked.
 * @param {Object} grid - The matrix to be checked.
 * @returns {Integer} 1 if occupied, 0 if unoccupied.
 */
function checkAvailability(room, date, grid) {
	const realDate = dayjs(date);

	if (dateIndex(realDate) < 0) { 
		return 1;
	}
	// Return 1 if occupied, 0 if not.
	return grid[room][dateIndex(realDate)] !== 0 ? 1 : 0; 
}

/**
 * Function that clears the whole matrix by setting all the entries to 0.
 */
function clearMatrix() {
	// For each key, set all entries to 0.
	for (const key in availabilityGrid) {
		for (let i = 0; i < availabilityGrid[key].length; i++) {
			availabilityGrid[key][i] = 0;
		}
	}
}

/**
 * Resets matrix completely, emptying rows and columns, and leaves an empty object. 
 */
function resetMatrix() {
          availabilityGrid = {}; // Set to empty object.
          firstDay = today; // Reset today
          console.log("Matrix reset.");
}

/**
 * Checks availability for a given room and date, in a specific grid (either availabilityGrid or tempMatrix).
 * @param {String} room - Room number matching the index of the matrix
 * @param {String} date - Date of booking to check in matrix
 * @param {Object} grid - Matrix to be checked
 * @returns {Integer} - Returns 1 if the room is occupied, and 0 if the room is unnocipied. 
 */

/**
 * The following functions have been developed for the purposes of program testing.
 */
export function getAvailabilityGridForTesting() { //
	return availabilityGrid;
}

export function getTempMinForTesting() { // Getter for the module's internal 'firstDay'.
	return firstDay;
}

export function setTempMinForTesting(newDate) { // 
	today = dayjs(newDate);
	firstDay = dayjs(newDate);
	console.log("First date set to: " + firstDay);
}