/**
 * This file is reponsible for creating the functions that need to be called when a button on the
 * html side is clicked. 
 * Contains functions appendToCalendar, resetEverything, resetMatrix, allocateLeastDiff, allocateRandom, allocateStayduration
 */
export { appendToCalendar, resetMatrix, resetEverything, generateBatches, allocateLeastDiff, allocateRandom, allocateStayDuration }

/**
 * Function that appends bookings into the calendar.
 * @param {array} - an array of bookingobjects to be pushed to the calendar [{booking 1}, {booking 2}...]
 * @param {string} - Specifies the rgb values with format "rgb(77, 160, 244)".
 */
function appendToCalendar(bookings, colorValue) {
    // Iterates through each booking we want to append to the calendar. And the specifies the information to be displayed.
    for (let i = 0; i < bookings.length; i++) { 
        calendar.addEvent( {
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

/** 
 * Function that is triggered upon a button click, resets both calender and current matrix.
 */ 
function resetEverything() {
    calendar.getEvents().forEach(event => event.remove()); // For every event, remove from calender
    resetMatrix();

    // Resets the evaluation score table
    document.getElementById('occupancy').textContent = "-";
    document.getElementById('ratio').textContent = "-";
    document.getElementById('avgPrefScoreBefore').textContent = "-";
    document.getElementById('avgPrefScoreAfter').textContent = "-";
    document.getElementById('assignedCount').textContent = "-";
    document.getElementById('failedCount').textContent = "-";
}

/** 
 * Function to reset the calendar.
 */
function resetMatrix() {
    // Sending POST request to router.js. When received this will reset the availablity matrix.
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
        // Reponse in the form of text, that the batch was generated.
        console.log('Calender was reset', result);
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation during reset:', error);
    });
}

/**
 * Function that sends a request to generate a batch of bookings, with the amount of bookings specified.
 */
function generateBatches() {
    const amountOfBookingsInput = document.querySelector("#bookingsInput");
    const amountOfBookings = parseInt(amountOfBookingsInput.value, 10);

    if (isNaN(amountOfBookings) || amountOfBookings < 1 || amountOfBookings > 10000) {
        alert("Please enter a number of bookings between 1 and 1000.");
        return;
    }

    let url = `generateBookings?amountOfBookings=${amountOfBookings}`; // Create URL string with days as a query parameter.

    // Sending POST request to router.js, as batches needs to be created in the backend.
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
        // Reponse in form of text that tells the batch has been generated.
        console.log('Batch generated:', result);
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation during batch:', error);
    });
    }

/**
 * function called when least Difference is clicked.
 * Is responsible of parsing numbers of days we want to simulate.
 * Is responsible of calling appendToCalendar with output from Least Difference algorithm.
 */
function allocateLeastDiff() {
    // Get the value from the input field with id "dayInput".
    // This value is used to determine the number of days for allocation.
    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // Fallback to 0 if input is empty or invalid.

    // Basic validation
    if (isNaN(days) || days < 1 || days > 365) {
        alert("Please enter a number of days between 1 and 365.");
        return;
    }

    let url = `leastDiff?days=${days}`; // Create URL string with days as a query parameter.

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok during appendToCalendar');
        }
        return response.json();
    })
    .then((data) => {
        // Call the appendToCalendar function with the fetched data, which appendToCalendars bookings into the calendar.
        appendToCalendar(data, "rgb(77, 160, 244)");
        updateEvaluationDisplay();
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation: during appendToCalendar', error);
    });
}

/**
 * function called when random is clicked.
 * Is responsible of parsing numbers of days we want to simulate
 * Is responsible of calling appendToCalendar with output from random allocation algorithm
 */
function allocateRandom() {
    // Get the value from the input field with id "dayInput"
    // This value is used to determine the number of days for allocation
    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // Fallback to 0 if input is empty or invalid

    // Basic validation
    if (isNaN(days) || days < 1 || days > 365) {
        alert("Please enter a number of days between 1 and 365.");
        return;
    }

    let url = `random?days=${days}`; // Create URL string with days as a query parameter

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok during appendToCalendar');
        }
        return response.json();
    })
    .then((data) => {
        // Call the appendToCalendar function with the fetched data, which appendToCalendars bookings into calendar.
        appendToCalendar(data, "rgb(45, 45, 49)");
        updateEvaluationDisplay();
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation: during appendToCalendar', error);
    });
}

/**
 * function called when StayDuration button is clicked.
 * Is responsible of parsing numbers of days we want to simulate
 * Is responsible of calling appendToCalendar with output from stayDuration algortihm
 */
function allocateStayDuration() {
    // Get the value from the input field with id "dayInput"
    // This value is used to determine the number of days for allocation
    const dayInput = document.querySelector("#dayInput");
    const days = parseInt(dayInput.value, 10) || 0; // Fallback to 0 if input is empty or invalid

    // Basic validation
    if (isNaN(days) || days < 1 || days > 365) {
        alert("Please enter a number of days between 1 and 365.");
        return;
    }

    let url = `stayDuration?days=${days}`; // Create URL string with days as a query parameter

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok during appendToCalendar');
        }
        return response.json();
    })
    .then((data) => {
        // Call the appendToCalendar function with the fetched data, which appendToCalendars bookings into calendar.
        appendToCalendar(data, "rgb(245, 154, 56)");
        updateEvaluationDisplay();
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation: during appendToCalendar', error);
    });
}

/**
 * function called when calendar needs to be updated (appendToCalendar) in every allocation algorithm.
 * Is responsible for updating the evaluation summary list on the webpage.
 * Creates fetch request for router which handles the calculation of the data that needs to be used.
 */
function updateEvaluationDisplay() {
    fetch('/evaluation')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch evaluation data.");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('occupancy').textContent = data.occupancy.toFixed(5);
            document.getElementById('ratio').textContent = data.ratio.toFixed(5);
            document.getElementById('avgPrefScoreBefore').textContent = data.avgPreferenceBefore.toFixed(5);
            document.getElementById('avgPrefScoreAfter').textContent = data.avgPreferenceAfter.toFixed(5);
            document.getElementById('assignedCount').textContent = data.assigned;
            document.getElementById('failedCount').textContent = data.failed;
        })
        .catch(error => {
            console.error("Evaluation fetch error:", error);
        });
}