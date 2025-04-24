import { loadRooms, loadBookings } from "./getInfo.js";
import { availabilityGrid, checkAvailability, dateDifference, insertBookings

 } from "../scripts/availabilityMatrix.js";
 import { sortByBooking } from "./impartial.js";

 const { bookingsInfo } = await loadBookings();
 //console.log("Loaded bookingsInfo:", bookingsInfo);
 const {roomsInfo} = await loadRooms()

import {getVisibleBookings} from "../scripts/assignBookings.js"
import { globalState } from "./globalVariables.js";
import dayjs from "dayjs";

export {easyalg}


function wastedSpace(matrix){
	let score = 0;
	let count = 0;
	
	 rooms.forEach((room) => {
      for (x in matrix[room]){
	      score += x;
	      count += 1
      }
    });
return x/count;
}


function insertBookingsTemp(newBookings) {
  // for each booking
  newBookings.forEach((booking) => {
	let startDate = new Date(booking.checkinDate);
	let endDate = new Date(booking.cheackOutDate);
	let roomNumber = booking.resourceIds; // Room ID

	// Calculate the index in the array (days from today)
	let startIndex = dateIndex(startDate);
	let endIndex = dateIndex(endDate);

	// Fill the grid for the room
	for (let i = startIndex; i <= endIndex; i++) {
	  Tempgrid[roomNumber][i] = 1; // Mark as occupied
	}
  });
  console.log("hej")
  console.log(Tempgrid);

  return Tempgrid;
}


function easyalg(newBookings) {
	let assignedBookings = [];

	sortByBooking(newBookings)
	newBookings.forEach((booking) => {

  
	  for (let room of roomsInfo) {
		let roomAvailable = true;
		console.log("checking for room" + room.roomNumber)
  
		// Check each day in the booking range
		for (let i = 0; i < dateDifference(booking.checkInDate, booking.checkOutDate); i++) {
		  let dag = dayjs(booking.checkInDate).add(i, 'day').format('YYYY-MM-DD');
  
		  if (checkAvailability(room.roomNumber, dag) === 1) {
			console.log(room.roomNumber + "is not available for dag" + dag)
			roomAvailable = false;
			break; // Stop checking this room — it's unavailable for one of the days
		  }
		}
		if (roomAvailable) {
			if (booking.checkInDate == globalState.currentDay){
				booking.resourceIds = room.roomNumber;
				booking.title = booking.dayOfBooking//`${booking.checkInDate} + ${booking.checkOutDate}`;
				assignedBookings.push(booking);
			 	insertBookings(assignedBookings) // insert after 1 booking is pushed so that room is unavailable
				break; // Booking is assigned, move on to next booking
			}
		}
	  }
  
	});
  
	console.log("Assigned Bookings:", assignedBookings);
	return assignedBookings;
  }



