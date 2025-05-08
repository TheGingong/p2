/**
 * 
 */

import {bookingsInfo, roomsInfo, loadBookings} from './getInfo.js'

await loadBookings();


console.log("ORIGINAL BOOKING ARRAY")
console.log(bookingsInfo);


let todayBookings2 = bookingsInfo.filter(booking => booking.dayOfBooking <= "2025-04-01");

console.log("NEW BOOKINGS ARRAY")
console.log(todayBookings2)