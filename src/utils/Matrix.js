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
          const { resourceIds, checkInDate, checkOutDate, duration, dayOfBooking, bookingId } = bookingObject;
          const existingBooking = this.Matrix[roomNumber][dayIndex];
if (existingBooking !== 0) {
          console.error(
                    `Fejl, kan ikke tilføje booking ${bookingId}' for room ${roomNumber} fra dag ${startDate} til checkOutDate`
          );
          return false; // Conflict found
}
}
}



}