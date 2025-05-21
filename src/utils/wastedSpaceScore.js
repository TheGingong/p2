//import { availabilityGrid } from "../scripts/availabilityMatrix.js";
export { wastedSpaceEvaluate };
import { availabilityGrid } from "../scripts/availabilityMatrix.js";

/**
 * Function that counts concecutive zeros. With the formula 1/numOfZero^2.
 * Not currently used as the logic didn't work as intended
 * @param {object} - Object containing the information about a room
 * @return {float} Outputs a value form 0 - 1 higher score is worse
 */
function wastedSpaceEvaluate(roomsObject) {
	const roomMatrix = Object.values(roomsObject);
	const consecutiveZeros = [];
	let currentCount = 0;

	if (!Array.isArray(roomMatrix)) {
		console.error("Input must be an array.");
		return [];
	}

	for (let i = 0; i < roomMatrix.length; i++) { // Loop through rows of the matrix.
		const innerArray = roomMatrix[i];

		if (!Array.isArray(innerArray)) {
			console.warn(`Element at index ${i} is not an array, skipping.`);
			continue;
		}
		let hasBegun = 0;

		for (let j = 0; j < innerArray.length; j++) { // Loop through columns of the matrix.
			const element = innerArray[j];

			if (element !== 0) {
				hasBegun = 1;
			}

			if (hasBegun === 0) {
				continue;
			}

			if (element === 0) { // If element is zero, increment the count.
				currentCount++;
			} else {
				if (currentCount > 0) { // When a zero streak ends, push the count to the array.
					consecutiveZeros.push(currentCount);
				}
				currentCount = 0;
			}
		}
		currentCount = 0; // Do not push, if the last element in array is a zero.
	          }
	
		let gapLength = 0;
                    let averageGapLength = 0


		for (const gap of consecutiveZeros) { // Count up all the penalties for the gaps.
			gapLength += gap;
                              console.log(gap);
		}
                    if (gapLength != 0) {
		averageGapLength = gapLength / consecutiveZeros.length; // Calculate the average gap length.
                    } else {
                              averageGapLength = 0;
                    }
					console.log("Average Gap Length: " + averageGapLength);
					console.log("Average Gap Score: " + (1 - (1 / averageGapLength))); // Give a normalized score.
                    return (averageGapLength === 0) ? 0 : 1 - (1 / averageGapLength);
}

/** Funtion that for each 'length' of consecutive bookings, gives back a penalty.
 * The bigger the gap, the bigger the penalty.
 */

/**
 * Function that loops over the entire avilability matrix, counting the number of times a zero occurs.
 * Prints the amount of zeros that were counted, as well total slots and ratio of filled slots.
 */
export function countZeroes() {
	let zeroCount = 0;
	let totalCount = 0;

	for (const key in availabilityGrid) { // Loops through the rows of the matrix.
		for (let i = 0; i < availabilityGrid[key].length; i++) { // Loops trough the columns of the matrix.
			if (availabilityGrid[key][i] === 0) {
				zeroCount++; // Increments the zero count if a zero is found.
			} else {
				totalCount++; // Increments the total count if a non-zero is found.
			}
		}
	}
	
	totalCount = totalCount + zeroCount; // Final count of total slots.

	let ratioSlots = 1 - (zeroCount / totalCount); // Ratio of filled slots is calculated by subtracting the ratio of zeroes from 1.
	console.log("Number of zero slots: " + zeroCount + " of total matrix slots " + totalCount);
	console.log("Ratio of filled slots: " + ratioSlots);
	return ratioSlots; // Returns the ratio of filled slots.
}