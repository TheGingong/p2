import { roomsInfo, bookingsInfo, loadBookings } from "./getInfo.js";

async function test() {
    await loadBookings();
    console.log("Jeg tester lige en tissemand", roomsInfo);
}

test();