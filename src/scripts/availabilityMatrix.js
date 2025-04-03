import { bookingsInfo, roomsInfo } from '../utils/getInfo.js';
import dayjs from 'dayjs';
//import 'dayjs/plugin/duration';

const d = new Date();
const todayish = dayjs(d)  // Get today's date
const today = todayish.subtract(1, 'day')


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

//console.log(dateIndex(today))
//bookingRange(test1)
//bookingRange(test2)
console.log(today)
console.log(dateDifference('2025-04-03', test1[0].endDate));
console.log(dateDifference(today, test1[0].endDate));
console.log(dateDifference(test1[0].endDate, test2[0].endDate));
