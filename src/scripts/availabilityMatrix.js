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

let today = dayjs(globalState.currentDay); // Get today's date

let availabilityGrid = {}; // global matrix

let temp_min = today;

// temp_min: Den "tidligere" last booking
// 20240422
// temp_max: Den nye last booking
function bookingRange(newBookings) {
  let temp_max = temp_min;
  let range = 0;

  /* if we have a new booking with a later end date we set the range 
    to be the differnce between the last end date and the new */
  for (let i of newBookings) {
    //console.log("i.enddate:" + i.endDate + "temp_max" + temp_max )
    if (dateIndex(i.checkOutDate) > dateIndex(temp_max)) {
      temp_max = i.checkOutDate;
    }
  }
  range = dateDifference(temp_min, temp_max);
  temp_min = temp_max;
  console.log(range);
  return range;
}

// Function that returns an index showing the difference from the given date to today in a number
function dateIndex(date) {
  const futureDate = dayjs(date); // Convert string to dayjs
  return futureDate.diff(today, "day");
}

function dateDifference(date1, date2) {
  return dayjs(date2).diff(dayjs(date1), "day");
}

/*
function dateDifference(date1, date2) {
	return date2.diff(date1, "day");
}*/

function extendGrid(rooms, date_range) {
  if (date_range === 0) {
    console.log(availabilityGrid);
    console.log("date_range = 0");
    return;
  }
  console.log("date_rage = " + date_range);
  let tempGrid = {};

  // if empty, create new grid and fill with 0
  if (Object.keys(availabilityGrid).length === 0) {
    rooms.forEach((room) => {
      availabilityGrid[room.roomNumber] = new Array(date_range).fill(0);
      console.log("grid empty, new grid created");
    });
  } else {
    // Makes temporary grid for the new matrix that needs to be appended to the total grid
    rooms.forEach((room) => {
      tempGrid[room.roomNumber] = new Array(date_range).fill(0);
    });
    console.log("avtempGRidailabilityGrid");
    console.log(tempGrid);

    // Appends the temp grid to the total grid
    // the format and syntax to push might be wrong atm..
    roomsInfo.forEach((room) => {
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

  console.log("availabilityGrid");
  console.log(availabilityGrid);
}

function insertBookings(newBookings, grid) {
  // for each booking
  //console.log("New Bookings:", newBookings);
  newBookings.forEach((booking) => {
    let startDate = new Date(booking.checkInDate);
    let endDate = new Date(booking.checkOutDate);
    let roomNumber = booking.resourceIds; // Room ID

    // Calculate the index in the array (days from today)
    let startIndex = parseInt(dateIndex(startDate));
    let endIndex = parseInt(dateIndex(endDate));
    // Fill the grid for the room
    grid[roomNumber][startIndex] = 1
    
    for (let i = startIndex+1; i < endIndex; i++) {
      grid[roomNumber][i] = 1; // Mark as occupied
    }
  });
  //console.log("hej")
  //console.log(grid);

  return grid;
}

function checkAvailability(room, date, grid) {
  const realDate = dayjs(date);

  if (dateIndex(realDate) < 0){
    return 1;
  }
  
  return grid[room][dateIndex(realDate)] === 1 ? 1 : 0;
}


function testAvailability() {
console.log("hej");
  const bookedDates = [];
  const date_range = availabilityGrid[101].length;

  for (let i = 0; i < date_range; i++) {
    if (checkAvailability(101, i) === 1) {
      bookedDates.push(i);
    }
  }
  console.log("length = " + availabilityGrid[101].length);
  console.log(bookedDates);
}
//testAvailability()


function resetMatrix(){
  for (const key in availabilityGrid) {
    for (let i = 0; i < availabilityGrid[key].length; i++) {
      availabilityGrid[key][i] = 0;
    }
  }
  //console.log("matrix after reset")
  //console.log(availabilityGrid)
}