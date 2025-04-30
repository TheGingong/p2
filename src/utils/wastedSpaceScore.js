import {availabilityGrid} from '../scripts/availabilityMatrix.js'

function algorithme(bookingsArray) {
	let val1 = prefScore();
	greedyAlgorithm(array, val1, val2);
	assignBookingsToMatrix(array);
	let val2 = wastedSpaceEvaluate(startDate, endDate);
}


let test = {
    0: [1,1,0,0,0,1],
    1: [0,0,1,1,1,0],
    2: [1,0,1,1,0,0],
    3: [0,0,1,1,1,1],
    4: [1,1,1,1,0,0],
    5: [1,1,1,1,0,1]
}

function wastedSpaceEvaluate(roomsObject) {
	let count = 0;
    let score = 0;

    const roomMatrix = Object.values(roomsObject);

	let consecutiveZeros = [];

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

		consecutiveZeros.forEach(n => {score += (1 / n^2)})
		let divider = roomMatrix[1].length * roomMatrix.length
		let averagePenaltyChancePerRoom = score / divider;
		return (averagePenaltyChancePerRoom * 2) - 1;
}

console.log(wastedSpaceEvaluate(test));