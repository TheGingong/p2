// Creates calender with the fullCalender library
// Fetches rooms from rooms.JSON and inserts into calender
// Creates tooltips for mouse hovers

// Makes a 'GET' request for the server, to request room data from JSON file
fetch('rooms', {
  method: 'GET',
  headers: {
      'Content-Type': 'application/json',
  },
})
  .then((response) => {
    console.log("test1")
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then((data) => {
      // Map roomTypes to FullCalendar resources
      console.log("test2")
      let roomResources = [];
      console.log("data received from rooms endpoint")

      // Pushes room data to our roomResources array
      data.roomTypes.forEach(room => {
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
        headerToolbar: {
          left: 'today prev,next',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
        },
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives', // Public key for private use
    
        initialView: 'booking_view', // Default view
        views: { // Initialization of calender setup, a default 7 day calender
          booking_view: {
            type: 'resourceTimeline',
            duration: {days: 7},
            slotLabelInterval: {days:1},
            slotLabelFormat: [{
              weekday: 'long' // Format for day titles
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
      
        
        
    
        // Add the eventDidMount option here (TOOL TIPS FUCKING UP - COMMENTING OUT FOR NOW)
        //eventDidMount: function (info) {
        //  tooltipMaker(info);
        //}
      });

      calendar.render(); // Renders the calender
      window.calendar = calendar; // Makes calender global by making it property of a global object
    });
    
  })
  .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
  });



// This function creates tooltips for mousehover over bookings
function tooltipMaker(info) {
  // Create a tooltip element
  let tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip'; // Match the CSS class

  // giga inefficient cuz toLocaleDatestring searched a big database to localize the date
  // We do this so the info.even.start gives us the timezone as well
  let formattedDate = info.event.start.toLocaleDateString();

  tooltip.innerHTML = `<strong>${info.event.title}</strong><br>${info.event.extendedProps.description || 'No description available'}<br>${formattedDate}`;
  document.body.appendChild(tooltip);

  // Use Popper.js to position the tooltip
  let popperInstance = Popper.createPopper(info.el, tooltip, {
      placement: 'top',
      modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
  });

  // Show the tooltip on mouseover
  info.el.addEventListener('mouseover', function () {
      tooltip.style.visibility = 'visible';
      tooltip.style.zIndex = '1000'; // Ensure it appears in front of other elements
  });

  // Hide the tooltip on mouseleave
  info.el.addEventListener('mouseleave', function () {
      tooltip.style.visibility = 'hidden';
  });
}

