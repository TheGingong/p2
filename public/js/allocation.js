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