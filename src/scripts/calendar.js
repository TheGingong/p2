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
    ]
  });


  calendar.render();
  window.calendar = calendar;


  calendar.on('eventClick', function(info){
    hej(info)
  })

});

