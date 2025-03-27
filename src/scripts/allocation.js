testarray = [
    { startDate: '2025-04-08', endDate: '2025-04-17', resourceIds: 'a' },
    { startDate: '2025-02-24', endDate: '2025-03-11', resourceIds: 'b' },
    { startDate: '2025-12-31', endDate: '2026-01-09', resourceIds: 'c' },
    { startDate: '2025-11-10', endDate: '2025-11-16', resourceIds: 'd' },
    { startDate: '2025-11-12', endDate: '2025-11-16', resourceIds: 'e' },
    { startDate: '2025-02-21', endDate: '2025-02-25', resourceIds: 'f' },
    { startDate: '2025-02-07', endDate: '2025-02-11', resourceIds: 'g' },
    { startDate: '2025-09-10', endDate: '2025-09-18', resourceIds: 'h' },
    { startDate: '2025-08-28', endDate: '2025-09-12', resourceIds: 'i' },
    { startDate: '2025-09-30', endDate: '2025-10-11', resourceIds: 'j' },
    { startDate: '2025-09-27', endDate: '2025-10-07', resourceIds: 'k' },
    { startDate: '2025-06-12', endDate: '2025-06-29', resourceIds: 'l' },
    { startDate: '2025-09-10', endDate: '2025-09-15', resourceIds: 'm' },
    { startDate: '2025-06-18', endDate: '2025-06-21', resourceIds: 'n' },
    { startDate: '2025-05-01', endDate: '2025-05-16', resourceIds: 'o' },
    { startDate: '2025-02-13', endDate: '2025-02-22', resourceIds: 'p' },
    { startDate: '2025-03-03', endDate: '2025-03-07', resourceIds: 'q' },
    { startDate: '2025-07-20', endDate: '2025-07-23', resourceIds: 'r' },
    { startDate: '2025-06-21', endDate: '2025-07-05', resourceIds: 's' },
    { startDate: '2025-04-02', endDate: '2025-04-06', resourceIds: 't' }
  ]

// addEvent (event objekt)
/* event object: {title: title for event,    start: start-date,     end: end-date,    resourceIds: ID of the room}*/
// Date format {yeah-month-day} eg. {2025-06-03} 
function allocate(testarray){
    console.log(testarray)
    for (let i = 0; i < testarray.length; i++){
        calendar.addEvent({
            title: testarray[i].title, 
            start: testarray[i].startDate, 
            end: testarray[i].endDate,
            resourceIds: [testarray[i].resourceIds],
            description: 'Lecture'
            
        });
    }
}


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

// Makes tooltipmaker global by adding it as a property to the window object
window.tooltipMaker = tooltipMaker;

