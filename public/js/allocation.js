// addEvent (event objekt)
/* event object: {title: title for event,    start: start-date,     end: end-date,    resourceIds: ID of the room}*/
export {allocate, resetMatrix, resetEverything, generateBatches, allocateAction, allocateRandom, allocateActioncheckDate}

// Function that allocates bookings into the calendar
// Takes in an array of bookings and adds them to the calendar, also takes a color depending on allocation method
function allocate(bookings, colorValue){
    console.log(bookings)
    for (let i = 0; i < bookings.length; i++){ // Loops through all bookings and addEvent to put in calender
        calendar.addEvent({
            title: `Booking ${bookings[i].title}`,
            start: bookings[i].checkInDate,
            end: bookings[i].checkOutDate,
            color: colorValue,
            resourceIds: [bookings[i].resourceIds],
            extendedProps: {
                guestsNumber: bookings[i].guestsNumber,
                daysOfBooking: bookings[i].daysOfBooking,
              },
              description: `Stay Duration: ${bookings[i].stayDuration} days`,
        });
    }
} 

// Function that when pressed, resets both calender and current matrix
function resetEverything(){
    calendar.getEvents().forEach(event => event.remove()); // For every event, remove from calender
    resetMatrix()
}

// Reset function to reset the calendar
function resetMatrix() {
    // Sending POST request to router.js
    fetch('reset', {
    method: "POST"
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok during reset');
        }
        return response.json();
    })
    .then((result) => {
        // Reponse in form of text that the batch was generated
        console.log('Calender was reset', result);
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation during reset:', error);
    });
}

// Function that generates batches and places it inside a JSON file
function generateBatches() {

    const amountOfBookingsInput = document.querySelector("#bookingsInput");
    const amountOfBookings = parseInt(amountOfBookingsInput.value, 10) || 0; // Fallback to 0 if input is empty or invalid

    let url = `generateBookings?amountOfBookings=${amountOfBookings}`; // Create URL string with days as a query parameter

    // Sending POST request to router.js, as we are creating batches on the server side
    fetch(url, {
    method: "POST"
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok during generating');
        }
        return response.json();
    })
    .then((result) => {
        // Reponse in form of text that tells the batch has been generated
        console.log('Batch generated:', result);
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation during batch:', error);
    });
    }


// Allocate function called upon button click. Used later to allocate bookings into calendar.
function allocateAction() {

    // Get the value from the input field with id "dayInput"
    // This value is used to determine the number of days for allocation
    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // Fallback to 0 if input is empty or invalid

    let url = `allocate?days=${days}`; // Create URL string with days as a query parameter

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok during allocate');
            }
            return response.json();
        })
        .then((data) => {
            // Call the allocate function with the fetched data, that allocates bookings into calendar
            allocate(data, "rgb(77, 160, 244)");
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation: during allocate', error);
        });
}

// Function that allocates random bookings into the calendar
function allocateRandom(){

    // Get the value from the input field with id "dayInput"
    // This value is used to determine the number of days for allocation
    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // Fallback to 0 if input is empty or invalid

    let url = `random?days=${days}`; // Create URL string with days as a query parameter

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok during allocate');
            }
            return response.json();
        })
        .then((data) => {
            // Call the allocate function with the fetched data, that allocates bookings into calendar
            allocate(data, "rgb(45, 45, 49)");
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation: during allocate', error);
        });
}


// Allocate function called upon button click. Used later to allocate bookings into calendar.
function allocateActioncheckDate() {

    // Get the value from the input field with id "dayInput"
    // This value is used to determine the number of days for allocation
    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // Fallback to 0 if input is empty or invalid

    let url = `allocate2?days=${days}`; // Create URL string with days as a query parameter

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok during allocate');
            }
            return response.json();
        })
        .then((data) => {
            // Call the allocate function with the fetched data, that allocates bookings into calendar
            allocate(data, "rgb(245, 154, 56)");
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation: during allocate', error);
        });
}