//import { availabilityGrid } from "../scripts/availabilityMatrix.js";
export { wastedSpaceEvaluate };

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
                    console.log("Current newScore: " + newScore + ". Current number: " + consecutiveZeros[i])
                    newScore += (1 / (consecutiveZeros[i] ** 2));
          }
	if (newScore !== 0) {
          occupancyScore += newScore / (consecutiveZeros.length);
          }

          return occupancyScore;
}
try {
const badArrays = [
         [0,1,0,1,0,1,0,1,0,1],
         [0,1,0,1,0,1,0,1,0,1],
         [0,1,0,1,0,1,0,1,0,1],
         [0,1,0,1,0,1,0,1,0,1],
         [0,1,0,1,0,1,0,1,0,1]
]
const fullArrays = [
          [1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1],
]

const NormalArrays = [
  [0, 0, 0, 1, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
  [], // Empty inner array
  [5, 6, 7], // No zeros
  [0, 0, 0, 0], // All zeros
  [1, 1, 1, 0], // Trailing zero
  [0, 1, 0, 0] // Leading and internal zeros
];

const result = wastedSpaceEvaluate(fullArrays);
//console.log("Input Arrays:", arrays);
console.log("Consecutive Zeros Counts:", result); // Expected: [3, 1, 2, 1, 1, 2, 2, 4, 1, 1, 2]

} catch {
          throw new Error ("Something went wrong bitch");
}