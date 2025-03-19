document.addEventListener('DOMContentLoaded', function() {
  let calendarEl = document.getElementById('calendar');
  let calendar = new FullCalendar.Calendar(calendarEl, {
 initialView: 'resourceTimelineMonth',
    resources: [
      { id: 'a', title: 'Room A' },
      { id: 'b', title: 'Room B' }  
    ],
  });
  window.calendar = calendar;
    calendar.render();
});