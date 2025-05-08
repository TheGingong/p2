/**
 * In this file we implement the function that may calculate the wasted space for a resulting allocation. 
 * This is done by considering the amount of consecutively mpty spaces between bookigns. 
 * The more empty spaces that occur consecutively, the less is the drawback on the space-optimization-score.
 */

import { availabilityGrid } from '../scripts/availabilityMatrix.js'

/**
 * 
 */
function wastedSpaceEvaluate(roomsObject) {
	let count = 0;
    let score = 0;

	// 
    const roomMatrix = Object.values(roomsObject);

	// Array that holds all the amounts of consecutive zeros that occur. 
	let consecutiveZeros = [];

	// 
	for (let j = 0; j < roomMatrix.length; j++) {
		for (let i = 0; i < roomMatrix[j].length; i++) {
			if (roomMatrix[j][i] === 0) {
				count++;
			} else if (roomMatrix[j][i] === 1 && count !== 0) {	
				consecutiveZeros.push(count);
				count = 0;
                
			}
        }
        consecutiveZeros.push(count);
        count = 0;
    }
    console.log(roomMatrix);
    console.log(consecutiveZeros);
	
	// 
	consecutiveZeros.forEach(n => {score += (1 / n^2)})
	let divider = roomMatrix[1].length * roomMatrix.length
	let averagePenaltyChancePerRoom = score / divider;
	return (averagePenaltyChancePerRoom * 2) - 1;
}