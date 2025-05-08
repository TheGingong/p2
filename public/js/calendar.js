// Creates calender with the fullCalender library
// Fetches rooms from rooms.JSON and inserts into calender

// Makes a 'GET' request for the server, to request room data from JSON file
fetch('rooms', {
  method: 'GET',
  headers: {
      'Content-Type': 'application/json',
  },
})
  .then((response) => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then((data) => {
      // Map roomTypes to FullCalendar resources
      let roomResources = [];
      console.log("Data received from rooms endpoint")

      // Pushes room data to our roomResources array
      data.forEach(room => {
              roomResources.push({
              id: room.roomNumber || "Not read from JSON",   // Fallback values, in case undefined, null or other is passed
              title: room.roomNumber || "Not read from JSON", 
              roomSize: room.roomGuests || "Not read from JSON",
          });
      });
      // Event listener that listens after the HTML page has been loaded and deferred scripts have been executed
      // calenderEl is created using the fullCalender library
    document.addEventListener('DOMContentLoaded', function() {
      let calendarEl = document.getElementById('calendar');
      let calendar = new FullCalendar.Calendar(calendarEl, {
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives', // Public key for private use
    
        initialView: 'booking_view', // Default view
        views: { // Initialization of calender setup, a default 7 day calender
          booking_view: {
            type: 'resourceTimeline',
            duration: {month: 1},
            slotLabelInterval: {days:1},
              slotLabelFormat: [{
              weekday: 'short',
              day: 'numeric',
              month: 'numeric',
               // Format for day titles
            }]
          }
        },
    
        aspectRatio: 1.5,
        // Creates columns on the far left, for rooms and room sizes
        resourceAreaColumns: [
          {
            field: 'title',
            headerContent: 'Room'
          },
          {
            field: 'roomSize',
            headerContent: 'Room size'
          }
        ],
        resources: roomResources, // Insert array to resources
      });

      calendar.render(); // Renders the calender
      window.calendar = calendar; // Makes calender global by making it property of a global object
    });
    
  })
  .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
  });

