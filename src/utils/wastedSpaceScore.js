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
		return []; // Return empty array for invalid input
	}

	// Iterate through each inner array in the main array
	for (let i = 0; i < roomMatrix.length; i++) {
		const innerArray = roomMatrix[i];

		// Check if the inner element is a valid array
		if (!Array.isArray(innerArray)) {
			console.warn(
				`Element at index ${i} is not an array, skipping.`
			);
			continue; // Skip non-array elements in the outer array
		}

		// Iterate through each element in the current inner array
		for (let j = 0; j < innerArray.length; j++) {
			const element = innerArray[j];

			// Check if the element is 0
			if (element === 0) {
				// Increment the count for consecutive zeros
				currentCount++;
			} else {
				// If the element is non-zero and we have a running count of zeros
				if (currentCount > 0) {
					// Push the count to the results array
					consecutiveZeros.push(
						currentCount
					);
				}
				// Reset the count since the sequence of zeros is broken
				currentCount = 0;
			}
		}

		// After iterating through an inner array, check if there's a trailing count of zeros
		if (currentCount > 0) {
			consecutiveZeros.push(currentCount);
		}
		currentCount = 0;
	}
	let occupancyScore = 0;
	let newScore = 0;

	for (let i = 0; i < consecutiveZeros.length; i++) {
			//console.log("Current newScore: " + newScore + ". Current number: " + consecutiveZeros[i])
			newScore += (1 / (consecutiveZeros[i] ** 2));
	}
	if (newScore !== 0) {
          occupancyScore += newScore / (consecutiveZeros.length);
          }

          return occupancyScore;
}

/**
 * Function that loops over the entire avilability matrix, counting the number of times a zero occurs.
 * Prints the amount of zeros that were counted.
 */
export function countZeroes() {
	let zeroCount = 0;

	for (const key in availabilityGrid) { //Loops through the rows of the matrix.
		for (let i = 0; i < availabilityGrid[key].length; i++) { //Loops trough the columns of the matrix.
			if (availabilityGrid[key][i] === 0) {
				zeroCount++;
			}
		}
	}
	console.log("Total number of zeros:", zeroCount);
}