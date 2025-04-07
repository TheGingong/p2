import { bookingsInfo, roomsInfo } from '../utils/getInfo.js';
import dayjs from 'dayjs';
//import 'dayjs/plugin/duration';
export {extendGrid, bookingRange, availabilityGrid}

const d = new Date();
const todayish = dayjs(d)  // Get today's date
const today = todayish.subtract(1, 'day')


let availabilityGrid = {}; // global matrix

let temp_min = today

let test1 = [{endDate: '2025-04-11'}]
let test2 = [{endDate: '2025-04-20'}]


// temp_min: Den "tidligere" last booking
// 20240422
// temp_max: Den nye last booking
function bookingRange(newBookings) {
	let temp_max = temp_min
	let range = 0;


    /* if we have a new booking with a later end date we set the range 
    to be the differnce between the last end date and the new */
	for (let i of newBookings) {
        //console.log("i.enddate:" + i.endDate + "temp_max" + temp_max )
		if (dateIndex(i.endDate) > dateIndex(temp_max)){
			temp_max=i.endDate
			}
	}
	range = dateDifference(temp_min, temp_max)
	temp_min = temp_max
    console.log(range)
	return (range)
}



// Function that returns an index showing the difference from the given date to today in a number
function dateIndex(date) {
    const futureDate = dayjs(date);  // Convert string to dayjs
    return futureDate.diff(today, "day"); 
}



function dateDifference(date1, date2) {
    return dayjs(date2).diff(dayjs(date1), "day");
}

/*
function dateDifference(date1, date2) {
	return date2.diff(date1, "day");
}*/





function extendGrid(rooms, date_range){
	if (date_range === 0){
		console.log(availabilityGrid)
		console.log("date_range = 0")
	return;
	}
	console.log("date_rage = " + date_range)
	let tempGrid = {}

	// if empty, create new grid and fill with 0
	if (Object.keys(availabilityGrid).length === 0){
		rooms.forEach(room => {
			availabilityGrid[room.roomNumber] = new Array(date_range).fill(0);
			console.log("grid empty, new grid created");
	});
	}
	
	else {
		// Makes temporary grid for the new matrix that needs to be appended to the total grid
		rooms.forEach(room => {
			tempGrid[room.roomNumber] = new Array(date_range).fill(0);
		});
		console.log("avtempGRidailabilityGrid")
		console.log(tempGrid);
		
		// Appends the temp grid to the total grid
		// the format and syntax to push might be wrong atm..
		roomsInfo.forEach(room => {	
		//		availabilityGrid[room.roomNumber].push(date_range.fill(0));
		});	   

		// nyt forsøg
		for (let roomNumber in tempGrid) {
				// Append the array from tempGrid to the corresponding array in availabilityGrid
				// ... spread the array from tempgrid and pushes them individually so we dont push the entire array as one element
				availabilityGrid[roomNumber].push(...tempGrid[roomNumber]);
			
		}
		// Append each room's temp grid to the existing grid
		
	}
	console.log("availabilityGrid")
	console.log(availabilityGrid)
}