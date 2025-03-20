

testarray = [
    {
        title: 'title', 
        start: '2025-03-20', 
        end: '2025-03-23',
        resourceIds: ['a']
    },
    {
        title: 'title', 
        start: '2025-03-21', 
        end: '2025-03-25',
        resourceIds: ['c']
    },
    {
        title: 'hejmmeddie', 
        start: '2025-03-18', 
        end: '2025-03-24',
        resourceIds: ['b'],
        extendedProps: {
            department: 'BioChemistry'
          },
          description: 'Lecture'
    }

]

// addEvent (event objekt)
/* event object: {title: title for event,    start: start-date,     end: end-date,    resourceIds: ID of the room}*/
function allocate(testarray){
    for (let i = 0; i < testarray.length; i++){
        calendar.addEvent({
            title: testarray[i].title, 
            start: testarray[i].start, 
            end: testarray[i].end,
            resourceIds: [testarray[i].resourceIds],
            extendedProps: {
                department: 'BioChemistry'
              },
              description: 'Lecture'
            
        });
    }
}


// this is a function
function yes(info) {
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

    // Show the tooltip on mouseenter
    info.el.addEventListener('mouseenter', function () {
        tooltip.style.visibility = 'visible';
        tooltip.style.zIndex = '1000'; // Ensure it appears in front of other elements
    });

    // Hide the tooltip on mouseleave
    info.el.addEventListener('mouseleave', function () {
        tooltip.style.visibility = 'hidden';
    });
}







function hej(info) {
    let eventObj = info.event;
    console.log("hej")
    console.log(eventObj)
    console.log(info)
    let tooltip = new bootstrap.Tooltip(info.el, {
        title: info.event.extendedProps.description,
        placement: 'top',
        trigger: 'hover',
        container: 'body'
    });
}