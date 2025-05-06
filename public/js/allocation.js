// addEvent (event objekt)
/* event object: {title: title for event,    start: start-date,     end: end-date,    resourceIds: ID of the room}*/
export {allocate, resetMatrix, resetEverything, generateBatches, allocateAction, allocateRandom, allocateActioncheckDate}

// Function that allocates bookings into the calendar
// Takes in an array of bookings and adds them to the calendar
function allocate(bookings, colurValue){
    console.log(bookings)
    for (let i = 0; i < bookings.length; i++){
        calendar.addEvent({
            title: `Booking ${bookings[i].title}`,
            start: bookings[i].checkInDate,
            end: bookings[i].checkOutDate,
            color: colurValue,
            resourceIds: [bookings[i].resourceIds],
            extendedProps: {
                guestsNumber: bookings[i].guestsNumber,
                daysOfBooking: bookings[i].daysOfBooking,
              },
              description: `Stay Duration: ${bookings[i].stayDuration} days`,
        });
    }
} 

function resetEverything(){
    // for every event, delete the event
    calendar.getEvents().forEach(event => event.remove());
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
    // Sending POST request to router.js, as we are creating batches on the server side
    fetch('batch365', {
    method: "POST"
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok during generating');
        }
        return response.json();
    })
    .then((result) => {
        // Reponse in form of text that the batch was generated
        console.log('Batch generated:', result);
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation during batch:', error);
    });
    }


// Allocate function called upon button click. Used later to allocate bookings into calendar.
function allocateAction() {

    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // fallback to 0 if input is empty or invalid

    let url = `allocate?days=${days}`;

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
            allocate(data, "blue");
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation: during allocate', error);
        });
}

// Function that allocates random bookings into the calendar
function allocateRandom(){
    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // fallback to 0 if input is empty or invalid

    let url = `random?days=${days}`;

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
            allocate(data, "pink");
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation: during allocate', error);
        });
}


// Allocate function called upon button click. Used later to allocate bookings into calendar.
function allocateActioncheckDate() {

    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // fallback to 0 if input is empty or invalid

    let url = `allocate2?days=${days}`;

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
            allocate(data, "green");
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation: during allocate', error);
        });
}