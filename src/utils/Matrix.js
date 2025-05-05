class Matrix {
          constructor(numRows, numCols) {
          this.rows = numRows;
          this.cols = numCols;
          this.Matrix = [];

          for (let i = 0; i < this.rows; i++) {
                    const Rooms = Array(this.cols).fill(0);
                    this.Matrix.push(Rooms);
          }
          console.log("Skabt nyt array");
}
addBooking(bookingObject) {
                    const { roomId, checkInDate, checkOutDate, duration, dayOfBooking, bookingId } = bookingObject;
                    const existingBooking = this.Matrix[roomNumber][dayIndex];
          if (existingBooking !== 0) {
                    console.error(`Fejl, kan ikke tilføje booking ${bookingId}' for room ${roomNumber} fra dag ${startDate} til checkOutDate`);
          return false; 
}
for (let dayIndex = checkInDate; dayIndex < checkOutDate; dayIndex++) {
          this.matrix[roomId][dayIndex] = bookingId;
        }
    
        console.log(`Booking '${bookingId}' added successfully for room ${roomId} from day ${checkInDate} to ${checkOutDate - 1}.`);
        return true; // Booking successful
      }
}
printMatrix() {
          console.log("\nCurrent Booking Matrix:");
          console.log("Room | Days ->");
          this.matrix.forEach((room, index) => {
            // Format each cell to be roughly the same width for better alignment
            const formattedRow = room.map(cell => String(cell).padStart(3, ' ')).join(' | ');
            console.log(` ${String(index).padStart(3, ' ')} | ${formattedRow}`);
          });
        }



