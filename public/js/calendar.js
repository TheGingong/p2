
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
      // Map roomTypes to FullCalendar resources
      let resources = [];

      data.roomTypes.forEach(room => {
          resources.push({
              id: room.roomNumber || "Not read from JSON",   // Fallback values, in case undefined, null or other is passed
              title: room.roomNumber || "Not read from JSON", 
              occupancy: room.guests || "Not read from JSON",
          });
      });

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
        resources: resources,
      
        
        
    
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

    
  })
  .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
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

