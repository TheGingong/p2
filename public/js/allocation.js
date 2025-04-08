// addEvent (event objekt)
/* event object: {title: title for event,    start: start-date,     end: end-date,    resourceIds: ID of the room}*/
export {allocate}

function allocate(bookings){
    console.log(bookings)
    for (let i = 0; i < bookings.length; i++){
        calendar.addEvent({
            title: `Booking ${bookings[i].resourceIds}`,
            start: bookings[i].checkInDate,
            end: bookings[i].checkOutDate,
            resourceIds: [bookings[i].resourceIds],
            extendedProps: {
                guestsNumber: bookings[i].guestsNumber,
              },
              description: `Stay Duration: ${bookings[i].stayDuration} days`,
            
        });
    }
} 