
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
      //console.log('Allocation data received:', data);
      console.log("Hello")
      // Call the allocate function with the fetched data
      data.roomTypes.forEach(room => {
        console.log(`Room Number: ${room.roomNumber}`);
        console.log(`Guests: ${room.guests}`);
        console.log(`Amenities: ${room.amenities.join(", ")}`);
        console.log("-".repeat(20));
    });
    
  })
  .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
  });


console.log


document.addEventListener('DOMContentLoaded', function() {
  let calendarEl = document.getElementById('calendar');

  let calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
    },
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',

    initialView: 'booking_view', // Default view
    views: {
      booking_view: {
        type: 'resourceTimeline',
        duration: {days: 7},
        slotLabelInterval: {days:1},
        slotLabelFormat: [{
          weekday: 'long'
        }]
      }
    },

    aspectRatio: 1.5,
    resourceAreaColumns: [
      {
        field: 'title',
        headerContent: 'Room'
      },
      {
        field: 'occupancy',
        headerContent: 'Occupancy'
      }
    ],
    resources: [
      { id: 'a', title: 'Room 1', occupancy: 1 },
      { id: 'b', title: 'Room 2', occupancy: 1 },
      { id: 'c', title: 'Room 3', occupancy: 1 },
      { id: 'd', title: 'Room 4', occupancy: 1 },
      { id: 'e', title: 'Room 5', occupancy: 1 },
      { id: 'f', title: 'Room 6', occupancy: 1 },
      { id: 'g', title: 'Room 7', occupancy: 1 },
      { id: 'h', title: 'Room 8', occupancy: 1 },
      { id: 'i', title: 'Room 9', occupancy: 2 },
      { id: 'j', title: 'Room 10', occupancy: 2 },
      { id: 'k', title: 'Room 11', occupancy: 2 },
      { id: 'l', title: 'Room 12', occupancy: 2 },
      { id: 'm', title: 'Room 13', occupancy: 2 },
      { id: 'n', title: 'Room 14', occupancy: 2 },
      { id: 'o', title: 'Room 15', occupancy: 3 },
      { id: 'p', title: 'Room 16', occupancy: 3 },
      { id: 'q', title: 'Room 17', occupancy: 3 },
      { id: 'r', title: 'Room 18', occupancy: 3 },
      { id: 's', title: 'Room 19', occupancy: 3 },
      { id: 't', title: 'Room 20', occupancy: 3 },
      { id: 'u', title: 'Room 21', occupancy: 3 },
      { id: 'v', title: 'Room 22', occupancy: 3 },
      { id: 'w', title: 'Room 23', occupancy: 4 },
      { id: 'x', title: 'Room 24', occupancy: 4 },
      { id: 'y', title: 'Room 25', occupancy: 4 },
      { id: 'z', title: 'Room 26', occupancy: 4 }
    ],
  
 
    

    // Add the eventDidMount option here
    eventDidMount: function (info) {
      tooltipMaker(info);
    }


  });






  calendar.render();
  window.calendar = calendar;


  /*calendar.on('eventClick', function(info){
    hej(info)
  }) */


});


// this is a function
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

