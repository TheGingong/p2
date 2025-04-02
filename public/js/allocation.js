// addEvent (event objekt)
/* event object: {title: title for event,    start: start-date,     end: end-date,    resourceIds: ID of the room}*/
export {allocate}

function allocate(testarray){
    console.log(testarray)
    for (let i = 0; i < testarray.length; i++){
        calendar.addEvent({
            title: testarray[i].title, 
            start: testarray[i].startDate, 
            end: testarray[i].endDate,
            resourceIds: [testarray[i].resourceIds],
            extendedProps: {
                department: 'BioChemistry'
              },
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
