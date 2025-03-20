

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
        title: 'title', 
        start: '2025-03-18', 
        end: '2025-03-24',
        resourceIds: ['b'],
        extendedProps: {
            department: 'BioChemistry'
          },
          description: 'Lecture'
    }

]

// addEvent (event)
/* event object: {title: title for event,    start: start-date,     end: end-date,    resourceIds: ID of the room}*/
function allocate(testarray){
    console.log(testarray)

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



function hej(info) {
    let eventObj = info.event;
    console.log("hej")
    console.log(eventObj)
    console.log(info)
    alert('Event: ' + info.event.extendedProps.description);
}