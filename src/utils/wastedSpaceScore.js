//import { availabilityGrid } from "../scripts/availabilityMatrix.js";
export { wastedSpaceEvaluate };
import { availabilityGrid } from "../scripts/availabilityMatrix.js";




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



export function countZeroes(){

	let zeroCount = 0;

for (const key in availabilityGrid) {
    for (let i = 0; i < availabilityGrid[key].length; i++) {
        if (availabilityGrid[key][i] === 0) {
            zeroCount++;
        }
    }
}
console.log("Total number of zeros:", zeroCount);
}