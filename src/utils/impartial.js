function createBookingBatch(batch) {
    let checkInYear, checkOutYear, checkInMonth, checkOutMonth, checkInDay, checkOutDay, startDate, endDate, duration, bookingObject, resourceIds;
    let array = [];
    let currentDay = new Date();
    let months = [31,28,31,30,31,30,31,31,30,31,30,31];
    checkInYear = currentDay.getFullYear();
    
    for (let i = 0; i < batch; i++) {
        checkInMonth = Math.floor((Math.random() * 12) + 1)
        let daysInMonth = months[checkInMonth-1]
        checkInDay = Math.floor((Math.random() * daysInMonth) + 1);
        duration = Math.floor((Math.random() * 19) + 1);

        if (checkInDay + duration > daysInMonth) {
            checkOutMonth = (checkInMonth + 1) % 12;
            checkOutDay = (checkInDay+duration)-daysInMonth
            if (checkInMonth + 1 > 12) {
                checkOutYear = checkInYear + 1;
            } else {
                checkOutYear = checkInYear;
            }
        } else {
            checkOutMonth = checkInMonth;
            checkOutYear = checkInYear;
            checkOutDay = (checkInDay+duration)
        }
        
        startDate = `${checkInYear}-${String(checkInMonth).padStart(2, '0')}-${String(checkInDay).padStart(2, '0')}`;
        endDate = `${checkOutYear}-${String(checkOutMonth).padStart(2, '0')}-${String(checkOutDay).padStart(2, '0')}`;

        resourceIds = String.fromCharCode('a'.charCodeAt(0) + i);
    
        bookingObject = {startDate, endDate, resourceIds};
        array.push(bookingObject);
    
        console.log("Here is booking object: ", bookingObject);
        console.log("Start date: ", startDate, "End date: ", endDate);
    } 
    
    console.log("Here is the array", array);
}

createBookingBatch(20);