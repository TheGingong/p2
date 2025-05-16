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

	for (let i = 0; i < roomMatrix.length; i++) {
		const innerArray = roomMatrix[i];

		if (!Array.isArray(innerArray)) {
			console.warn(`Element at index ${i} is not an array, skipping.`);
			continue;
		}

		for (let j = 0; j < innerArray.length; j++) {
			const element = innerArray[j];
			if (element === 0) {
				currentCount++;
			} else {
				if (currentCount > 0) {
					consecutiveZeros.push(currentCount);
				}
				currentCount = 0;
			}
		}

		if (currentCount > 0) {
			consecutiveZeros.push(currentCount);
		}
		currentCount = 0;
	}
	
		let totalPenalty = 0;
		for (const gap of consecutiveZeros) {
			totalPenalty += getPenaltyForGap(gap);
		}
	
		const averagePenalty = totalPenalty / (consecutiveZeros.length);
		
		const totalOccupancyScore = Math.max(0, Math.min(1, averagePenalty));
		console.log("Total wasted space score: " + totalOccupancyScore);
}

function getPenaltyForGap(length) {
    return 1 / Math.sqrt(length + 1);
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

	let totalCount = 0;
	for (const key in availabilityGrid) { //Loops through the rows of the matrix.
		for (let i = 0; i < availabilityGrid[key].length; i++) { //Loops trough the columns of the matrix.
				totalCount++;
		}
	}
	let ratioSlots = zeroCount / totalCount;
	console.log("Number of zero slots: " + zeroCount + " of total matrix slots " + totalCount);
	console.log("Ratio of zero slots: " + ratioSlots);
}