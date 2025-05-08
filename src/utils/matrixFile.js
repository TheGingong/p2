import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { roomsIndexToResourceId } from './globalVariables.js';
dayjs.extend(utc);

// Testing comment

function loadBookingsFromJSON(jsonData) { //Load directly from json test
          if (typeof dayjs === 'undefined' || typeof dayjs.utc === 'undefined') {
               console.error("Day.js or Day.js UTC plugin not loaded. Cannot process dates.");
               return null;
          }

          if (!Array.isArray(jsonData) || jsonData.length === 0) {
              console.error("Error loading bookings: Input data must be a non-empty array.");
              return null;
          }
      
          let earliestDate = null;
          let baseDate = null;
    
          try {
              for (const item of jsonData) {
                  if (!item.checkInDate) {
                      console.warn(`Skipping item due to missing checkInDate: ${JSON.stringify(item)}`);
                      continue;
                  }
                  // Parse using Day.js UTC and strict format check
                  const currentCheckIn = dayjs.utc(item.checkInDate, 'YYYY-MM-DD', true); // Strict parsing
                   if (!currentCheckIn.isValid()) { // Use Day.js validation
                      throw new Error(`Invalid checkInDate format or value found: "${item.checkInDate}"`);
                   }
      
                  if (earliestDate === null || currentCheckIn.isBefore(earliestDate)) {
                      earliestDate = currentCheckIn;
                  }
              }
          } catch (error) {
               console.error(`Error finding earliest date: ${error.message}`);
               return null;
          }
      
      
          if (earliestDate === null) {
              console.error("Error loading bookings: No valid check-in dates found in the data.");
              return null;
          }

          baseDate = earliestDate; // Our reference point (index 0), Day.js object
          console.log(`Base date (Index 0) established as: ${baseDate.format('YYYY-MM-DD')}`);
      
          // 2. Define conversion functions based on the calculated baseDate
          const dateToIndex = (dateString) => {
              const targetDate = dayjs.utc(dateString, 'YYYY-MM-DD', true); // Strict parsing
              if (!targetDate.isValid()) {
                  console.error(`Invalid date string for dateToIndex: ${dateString}`);
                  return null;
              }
              return targetDate.diff(baseDate, 'day'); // Use Day.js diff
          };
      
          const indexToDate = (index) => {
              if (!Number.isInteger(index)) {
                   console.error(`Invalid index for indexToDate: ${index}`);
                   return null;
              }
              const targetDate = baseDate.add(index, 'day'); 
              return targetDate.format('YYYY-MM-DD');
          };
      
          const bookingsArray = [];
          for (const item of jsonData) {
               try {
                  // Ensure required fields exist
                  if (!item.checkInDate || !item.checkOutDate || typeof item.bookingId === 'undefined') {
                       console.warn(`Skipping item due to missing required fields (checkInDate, checkOutDate, bookingId): ${JSON.stringify(item)}`);
                       continue;
                  }
      
                  const checkInIndex = dateToIndex(item.checkInDate);
                  const checkOutString = item.checkOutDate; // Last day *of* stay (inclusive)
      
                  // Calculate the check-out index (day *after* the last day)
                  const lastDayIndex = dateToIndex(checkOutString);
      
                   if (checkInIndex === null || lastDayIndex === null) {
                       console.warn(`Skipping booking ID ${item.bookingId} due to invalid date conversion for checkIn "${item.checkInDate}" or checkOut "${item.checkOutDate}".`);
                       continue;
                   }

                   const checkOutIndexExclusive = lastDayIndex + 1;
      
                   const newBooking = new Booking(
                       item.dayOfBooking, 
                       checkInIndex,
                       checkOutIndexExclusive,
                       item.bookingId,
                       item 
                   );
                   bookingsArray.push(newBooking);
      
               } catch (error) {
                   console.warn(`Skipping item due to error during Booking creation: ${error.message}. Item: ${JSON.stringify(item)}`);
               }
          }
          
          return {
              bookings: bookingsArray,
              baseDate: baseDate,
              dateToIndex: dateToIndex,
              indexToDate: indexToDate
          };
      }

function validateAddBookingArgs(bookingObject, targetRoomId, matrixInstance) {
          if (!bookingObject ||
              typeof bookingObject.checkInDate !== 'number' ||
              typeof bookingObject.checkOutDate !== 'number' ||
              typeof bookingObject.bookingId === 'undefined' ||
              bookingObject.bookingId === null)
          {
              console.error("Validation Error (addBooking): Invalid bookingObject structure or missing properties.");
              return false;
          }
      
          const { checkInDate, checkOutDate, bookingId } = bookingObject;
          const { rooms, days, matrix } = matrixInstance; 
      
          if (!Number.isInteger(targetRoomId) || targetRoomId < 0 || targetRoomId >= rooms) {
              console.error(`Validation Error (addBooking): Invalid targetRoomId '${targetRoomId}'. Must be an integer between 0 and ${rooms - 1}.`);
              return false;
          }
      
          if (!Number.isInteger(checkInDate) || !Number.isInteger(checkOutDate) ||
              checkInDate < 0 || checkInDate >= days ||
              checkOutDate <= 0 || checkOutDate > days) 
          {
             console.error(`Validation Error (addBooking): Invalid date indices [${checkInDate}, ${checkOutDate}). Must be integers within [0, ${days}).`);
             return false;
          }
      
          if (checkInDate >= checkOutDate) {
             console.error(`Validation Error (addBooking): Check-in date (${checkInDate}) must be strictly before check-out date (${checkOutDate}).`);
             return false;
          }
      
          if (String(bookingId).trim() === '') {
             console.error(`Validation Error (addBooking): bookingId cannot be empty.`);
             return false;
          }
      
          for (let dayIndex = checkInDate; dayIndex < checkOutDate; dayIndex++) {
              if (matrix[targetRoomId] && typeof matrix[targetRoomId][dayIndex] !== 'undefined') {
                   const existingBooking = matrix[targetRoomId][dayIndex];
                   if (existingBooking !== 0) {
                      console.error(`Validation Error (addBooking): Conflict detected. Room ${targetRoomId} is already booked on day ${dayIndex} (Existing Booking ID: ${existingBooking}).`);
                      return false; // Conflict found
                   }
              } else {
                  console.error(`Internal Validation Error (addBooking): Attempting to check conflict in non-existent cell [${targetRoomId}][${dayIndex}]. This indicates a potential issue with previous checks.`);
                  return false;
              }
          }
          return true;
      }
function validateCoordinates(roomId, dayIndex, matrixInstance) {
          const { rooms, days } = matrixInstance;
          const isValid = Number.isInteger(roomId) && Number.isInteger(dayIndex) &&
                 roomId >= 0 && roomId < rooms &&
                 dayIndex >= 0 && dayIndex < days;
           if (!isValid) {
              console.error(`Validation Error (${context}): Invalid coordinates (${roomId}, ${dayIndex}). Must be within [0..${rooms-1}, 0..${days-1}].`);
          }
          return isValid;
     }

    function validateGetBookingArgs(roomId, dayIndex, matrixInstance) {
          const { rooms, days } = matrixInstance;
          const isValid = Number.isInteger(roomId) && Number.isInteger(dayIndex) &&
                 roomId >= 0 && roomId < rooms &&
                 dayIndex >= 0 && dayIndex < days;
           if (!isValid) {
              console.error(`Validation Error (getBooking): Invalid coordinates (${roomId}, ${dayIndex}). Must be within [0..${rooms-1}, 0..${days-1}].`);
          }
          return isValid;
    }

function validateCreateGhostMatrixArgs(startIndex, endIndex, matrixInstance) {
          const { days } = matrixInstance;
          const isValid = Number.isInteger(startIndex) && Number.isInteger(endIndex) &&
                 startIndex >= 0 && startIndex < days &&
                 endIndex >= 0 && endIndex < days && // endIndex is inclusive, must be < cols
                 startIndex <= endIndex; // Allow startIndex == endIndex for a single column slice
          if (!isValid) {
             console.error(`Validation Error (createGhostMatrix): Invalid slice indices [${startIndex}, ${endIndex}] (inclusive). Must be integers within [0, ${days - 1}] and start <= end.`);
         }
         return isValid;
}

function isDateOrderCorrect(checkInDate, checkOutDate) {
          const isValid = checkInDate < checkOutDate;
          if (!isValid) {
             console.error(`Validation Error: Check-in date (${checkInDate}) must be strictly before check-out date (${checkOutDate}).`);
          }
          return isValid;
}

function isValidBookingId(bookingId) {
          const isValid = typeof bookingId !== 'undefined' && bookingId !== null && String(bookingId).trim() !== '';
           if (!isValid) {
              console.error(`Validation Error: bookingId is missing or invalid.`);
          }
          return isValid;
}

function extractBaseBookingId(cellValue) {
          if (typeof cellValue === 'string') {
              if (cellValue.startsWith('s - ')) {
                  return cellValue.substring(4);
              }
              if (cellValue.startsWith('e - ')) {
                  return cellValue.substring(4);
              }
          }
          // If it's not a prefixed string, assume it's the ID itself (or 0)
          return cellValue;
}


class Booking {

	constructor(dayOfBooking, checkInDate, checkOutDate, bookingId, originalData = {}) {
                    //Debug stuffs
                    if (!isDateOrderCorrect(checkInDate, checkOutDate) || !isValidBookingId(bookingId)) {
                              throw new Error("Invalid arguments for Booking constructor. See previous validation errors.");
                    }
		this.roomId = null;
		this.checkInDate = checkInDate;
		this.checkOutDate = checkOutDate;
		this.duration = checkOutDate - checkInDate;
		this.dayOfBooking = dayOfBooking;
		this.bookingId = bookingId;
                    this.originalData = originalData;
	}

	printInfo() {
		console.log(`--- Booking Info (ID: ${this.bookingId}) ---`);
		console.log(`  Made on: ${this.dayOfBooking}`);
		console.log(`  Check-in Day Index: ${this.checkInDate}`);
		console.log(`  Check-out Day Index: ${this.checkOutDate}`);
		console.log(`  Duration (days): ${this.duration}`);
		if (this.roomId === null) {
		console.log("  Status: Not assigned to a room yet.");
		} else {
			console.log(`  Status: Assigned to Room Index: ${this.roomId}`);
		}
		console.log("------------------------------------");
	}
          clear() {
                    this.roomId = null;
                    console.log(`Booking '${this.bookingId}' assignment cleared (roomId set to null).`);
          }
}

class Rooms {
          constructor(roomNumber, roomGuests) {
                    this.Number = roomNumber,
                    this.Size = roomGuests;
          }
}

class Matrix {
          //Funktionen der bygger en ny matrix.
	constructor(numRows, numCols) {
                    if (!Number.isInteger(numRows) || !Number.isInteger(numCols) || numRows <= 0 || numCols <= 0) {
                              throw new Error("Matrix dimensions (rows, cols) must be positive integers.");
                    }
                    this.startDate = null;
		this.rooms = numRows;
		this.days = numCols;
		this.matrix = [];
        this.bookingsMap = new Map(); //Booking map for at kunne pege direkte på objekter i stedet for deres id.
        this.roomsMap = new Map();

                    if (arguments.length === 2) {
                              this.initMatrix();
                              console.log(`Created a new matrix with ${this.rooms} rooms and ${this.days} columns.`);
                    }
	}
    createFilteredMatrix(guestsNumber = null, sliceConfig = null) {
        let newFilteredRooms = this.orderedRooms;
        if (guestsNumber !== null) {
            newFilteredRooms = this.orderedRooms.filter(room => room.roomGuests === guestsNumber);
        }

        let newMatrixRefDateStr = this.matrixReferenceDate.format('YYYY-MM-DD');
        let newMatrixDatesArray = [...this.orderedDates];

        if (sliceConfig && sliceConfig.startIndex !== undefined && sliceConfig.endIndex !== undefined) {
            const { startIndex, endIndex } = sliceConfig;
            if (startIndex >= 0 && endIndex < this.orderedDates.length && startIndex <= endIndex) {
                newMatrixRefDateStr = this.orderedDates[startIndex];
                newMatrixDatesArray = this.orderedDates.slice(startIndex, endIndex + 1);
            } else {
                console.warn("Invalid sliceConfig provided. Using full date range of current matrix.");
            }
        }
        
        // The new matrix still needs all bookings in the system for context,
        // as filtering/slicing is about display, not removing booking data from consideration.
        return new Matrix(newFilteredRooms, Array.from(this.allBookingsInSystem.values()), newMatrixRefDateStr, newMatrixDatesArray);
    }
          //Initialiser en ny matrice og fyld den ud med 0'er.
          initMatrix() {
                    this.matrix = [];
                    for (let i = 0; i < this.rooms; i++) {
                       const roomAvailability = Array(this.days).fill(0);
                       this.matrix.push(roomAvailability);
                    }
              this.bookingsMap.clear();
          }

          roomId(index) {
            // Calling the hash map that takes in an index and returns the corresponding room object
            const roomDetails = roomsIndexToResourceId[index];
            return roomDetails;
          }

          registerBookings(bookingsArray) {
                    if (!Array.isArray(bookingsArray)) {
                        console.error("registerBookings requires an array.");
                        return;
                    }
                    this.bookingsMap.clear(); // Clear previous registrations if any
                    bookingsArray.forEach(booking => {
                        if (booking && typeof booking.bookingId !== 'undefined') {
                            this.bookingsMap.set(booking.bookingId, booking);
                        } else {
                            console.warn("Attempted to register an invalid booking object:", booking);
                        }
                    });
                    console.log(`Registered ${this.bookingsMap.size} bookings with the matrix.`);
          }

               
	        //Tilføj bookings til en ny matrix.
	        addBooking(bookingObject, targetRoomId) {

                    //Error checks og stuff
                    if (!validateAddBookingArgs(bookingObject, targetRoomId, this)) {
                              return false;
                    }

		    const { checkInDate, checkOutDate, bookingId } = bookingObject;

		for (let dayIndex = checkInDate; dayIndex < checkOutDate; dayIndex++) {
			if (dayIndex == checkInDate) {
				this.matrix[targetRoomId][dayIndex] = "s - " + bookingId;
			} else if (dayIndex == checkOutDate - 1) {
				this.matrix[targetRoomId][dayIndex] = "e - " + bookingId;
			} else {
				this.matrix[targetRoomId][dayIndex] = bookingId;
			}
		}

		bookingObject.roomId = targetRoomId;

		console.log(`Booking '${bookingId}' added successfully to room ${targetRoomId} from day ${checkInDate} to ${checkOutDate - 1}. Booking object updated.`);
		return true;
	}
	printMatrix() {
                    console.log("\nCurrent Booking Matrix:");
                    const numCols = this.matrix[0].length; // Get the number of columns (days)
                    const cellPadding = 8; // Define padding for data cells and column indices
                    const rowIndexPadding = 3; // Define padding for row indices
                  
                    // --- Create and print the column index bar ---
                    let indexBar = ` ${" ".padStart(rowIndexPadding)} | `; // Initial padding to align with row indices
                    for (let j = 0; j < numCols; j++) {
                      indexBar += String(j).padStart(cellPadding, " ") + " | ";
                    }
                    // Remove the trailing " | "
                    indexBar = indexBar.slice(0, -3);
                    console.log(indexBar);
                    // --- End of index bar ---
                  
                    // Print a separator line (optional, for clarity)
                    // Adjust the separator length based on padding and number of columns
                    const separatorLength = (rowIndexPadding + 3) + (numCols * (cellPadding + 3)) -1;
                    console.log("-".repeat(separatorLength));
                  
                  
                    // Print the existing header (adjust alignment if needed) - This line might be redundant now
                    // console.log("Room | Days ->"); // You might want to remove or adjust this
                  
                    // Print each row with its index
                    this.matrix.forEach((room, index) => {
                      // Format each cell in the row with padding
                      const formattedRow = room
                        .map((cell) => String(cell).padStart(cellPadding, " "))
                        .join(" | ");
                      // Print the row index (padded) and the formatted row data
                      console.log(` ${String(index).padStart(rowIndexPadding, " ")} | ${formattedRow}`);
                    });
                  
                    console.log("-".repeat(separatorLength)); // Footer separator
                  }

          getBooking(roomId, dayIndex) {
                    // --- Use Coordinate Validation Function ---
                    if (!validateCoordinates(roomId, dayIndex, this)) {
                        return null; // Invalid coordinates
                    }
              
                    const cellValue = this.matrix[roomId][dayIndex];
            
                    if (cellValue === 0) {
                        return 0; // Return 0 for empty cell as requested (or null if preferred)
                    }

                    const baseBookingId = extractBaseBookingId(cellValue);
              
                    const lookupId = !isNaN(Number(baseBookingId)) ? Number(baseBookingId) : baseBookingId;
              
                    const bookingObject = this.bookingsMap.get(lookupId);
              
                    if (!bookingObject) {
                        console.warn(`getBooking: Found ID '${baseBookingId}' in matrix at [${roomId}, ${dayIndex}], but no corresponding Booking object was registered.`);
                        return null; // Or potentially return the raw ID as a fallback? User wants the object.
                    }
              
                    return bookingObject; // Return the found Booking object
          }

	createGhostMatrix(startIndex, endIndex) {
		const slicedData = [];
		for (let i = 0; i < this.rooms; i++) {
			const roomSlice = this.matrix[i].slice(startIndex, endIndex+1);
			slicedData.push(roomSlice);
		}
		const numNewDays = endIndex+1 - startIndex;
		const newMatrixInstance = new Matrix(this.rooms, numNewDays);

		newMatrixInstance.matrix = slicedData;

		console.log(`Created new Matrix instance from column index ${startIndex} to ${endIndex - 1}.`);
		return newMatrixInstance;
	}

          swapIndex(roomId1, dayIndex1, roomId2, dayIndex2) {
                    /*const isValidPos1 = validateCoordinates(roomId1, dayIndex1, this, 'swapIndex (pos1)');
                    const isValidPos2 = validateCoordinates(roomId2, dayIndex2, this, 'swapIndex (pos2)');
                    //Debug stuffff
                    if (!isValidPos1 || !isValidPos2) {
                        console.error("Swap failed due to invalid coordinates. See previous errors.");
                        return false;
                    }*/
                    const tempValue = this.matrix[roomId1][dayIndex1];
             
                    this.matrix[roomId1][dayIndex1] = this.matrix[roomId2][dayIndex2];

                    this.matrix[roomId2][dayIndex2] = tempValue;
             
                    console.log(`Successfully swapped values at [${roomId1}, ${dayIndex1}] and [${roomId2}, ${dayIndex2}].`);
                    return true;
          }

          clear() {
                    this.initializeMatrix();
                    console.log(`Matrix cleared. All ${this.rooms}x${this.days} cells reset to 0.`);
          }
}
try {
          //const jsonData = data;
          //const loadedData = loadBookingsFromJSON(jsonData);
	        //const bookingCalendar = new Matrix(5, 10);
          //bookingCalendar.printMatrix();
          const bookingCalendar = new Matrix(5,10);
          const booking1 = new Booking(1,3,8,"A101", null);
          bookingCalendar.addBooking(booking1, 3);
          bookingCalendar.printMatrix();
          console.log(bookingCalendar.getBooking(3,5));
          if (loadedData) {
                    const { bookings, baseDate, dateToIndex, indexToDate } = loadedData;
            
                    console.log(`\nLoaded ${bookings.length} booking objects.`);
                    console.log(`Base Date (Index 0): ${baseDate.format('YYYY-MM-DD')}`);
            
                    // 2. Determine Matrix Size
                    let maxIndex = 0;
                    bookings.forEach(b => { if (b.checkOutDate > maxIndex) maxIndex = b.checkOutDate; });
                    const numColsNeeded = maxIndex;
                    const numRows = 5; // Example: Assume 5 rooms
                    console.log(`\nMatrix dimensions needed: ${numRows} rows x ${numColsNeeded} columns (days)`);
            
                    // 3. Create the Matrix
                    const bookingCalendar = new Matrix(numRows, numColsNeeded);
            
                    // *** 4. Register Booking Objects with the Matrix ***
                    console.log("\n--- Registering Bookings with Matrix ---");
                    bookingCalendar.registerBookings(bookings);
            
                    // 5. Add loaded bookings to the Matrix grid
                    console.log("\n--- Adding Bookings to Matrix Grid ---");
                    bookings.forEach(booking => {
                        const targetRoom = parseInt(booking.originalData.resourceIds || booking.bookingId) % numRows;
                         if (!isNaN(targetRoom)) {
                             bookingCalendar.addBooking(booking, targetRoom);
                         } else {
                             console.warn(`Could not determine target room for booking ${booking.bookingId}, skipping add.`);
                         }
                    });
            
                    bookingCalendar.printMatrix("Booking Matrix with Dates", indexToDate);
            
                    // *** 7. Test the updated getBooking ***
                    console.log("\n--- Testing getBooking (returns object) ---");
                    const bookingAtPos = bookingCalendar.getBooking(0, 15); // Should be booking 28
                    const bookingAtStart = bookingCalendar.getBooking(0, 8); // Should be booking 128 (start marker)
                    const bookingAtEnd = bookingCalendar.getBooking(0, 19); // Should be booking 97 (end marker)
                    const emptyCell = bookingCalendar.getBooking(1, 10); // Should be 0
                    const invalidCell = bookingCalendar.getBooking(10, 10); // Should be null
            
                    console.log("\nBooking at [0, 15]:");
                    if (bookingAtPos && bookingAtPos !== 0) bookingAtPos.printInfo(indexToDate); else console.log(bookingAtPos);
            
                    console.log("\nBooking at [0, 8] (Start):");
                     if (bookingAtStart && bookingAtStart !== 0) bookingAtStart.printInfo(indexToDate); else console.log(bookingAtStart);
            
                    console.log("\nBooking at [0, 19] (End):");
                     if (bookingAtEnd && bookingAtEnd !== 0) bookingAtEnd.printInfo(indexToDate); else console.log(bookingAtEnd);
            
                    console.log(`\nValue at [1, 10]: ${emptyCell}`); // Should be 0
                    console.log(`Value at [10, 10]: ${invalidCell}`); // Should be null
            
            
                } else {
                    console.error("Failed to load booking data.");
                }
} catch(error) {
	console.error("An error occurred outside the Matrix class:", error.message);
}
