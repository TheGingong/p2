function wastedSpaceEvaluate(roomsObject) {
        // Convert the values of the roomsObject into an array.
        const roomMatrix = Object.values(roomsObject);
        // Initialize an array to store the lengths of consecutive zeros.
        const consecutiveZeros = [];
        // Initialize a counter for the current streak of zeros.
        let currentCount = 0;

        // Check if the input roomMatrix is actually an array.
        if (!Array.isArray(roomMatrix)) {
                // If not an array, log an error and return an empty array.
                console.error("Input must be an array.");
                return [];
        }

        // Loop through each row of the roomMatrix.
        for (let i = 0; i < roomMatrix.length; i++) { // Loop through rows of the matrix.
                // Get the current inner array (row).
                const innerArray = roomMatrix[i];

                // Check if the current element in roomMatrix is an array.
                if (!Array.isArray(innerArray)) {
                        // If not an array, log a warning and skip to the next iteration.
                        console.warn(`Element at index ${i} is not an array, skipping.`);
                        continue;
                }
                // Flag to indicate if a non-zero element has been encountered in the current row.
                let hasBegun = 0;

                // Loop through each element (column) of the innerArray.
                for (let j = 0; j < innerArray.length; j++) { // Loop through columns of the matrix.
                        // Get the current element.
                        const element = innerArray[j];

                        // Check if the element is not zero.
                        if (element !== 0) {
                                // If it's not zero, set hasBegun to 1, indicating that the counting of zeros (gaps) should start.
                                hasBegun = 1;
                        }

                        // Check if a non-zero element has not yet been encountered in this row.
                        if (hasBegun === 0) {
                                // If hasBegun is still 0, it means we are at the beginning of the row with leading zeros,
                                // so we skip to the next element.
                                continue;
                        }

                        // Check if the current element is zero.
                        if (element === 0) { // If element is zero, increment the count.
                                // If it is zero, increment the current count of consecutive zeros.
                                currentCount++;
                        } else {
                                // If the element is not zero, it means a streak of zeros (if any) has ended.
                                // Check if there was a streak of zeros before this non-zero element.
                                if (currentCount > 0) { // When a zero streak ends, push the count to the array.
                                        // If currentCount is greater than 0, push the length of the just-ended zero streak to the consecutiveZeros array.
                                        consecutiveZeros.push(currentCount);
                                }
                                // Reset the current count of zeros.
                                currentCount = 0;
                        }
                }
                // Reset currentCount at the end of each row.
                // This ensures that zero streaks at the very end of a row are not pushed,
                // as per the comment "Do not push, if the last element in array is a zero."
                currentCount = 0;
        }

        // Initialize a variable to sum the lengths of all identified gaps.
        let gapLength = 0;
        // Initialize a variable to store the average gap length.
        let averageGapLength = 0;


        // Loop through each gap length recorded in consecutiveZeros.
        for (const gap of consecutiveZeros) { // Count up all the penalties for the gaps.
                // Add the current gap length to the total gapLength.
                gapLength += gap;
                console.log(gap);
        }

        // Check if there were any gaps found (i.e., gapLength is not zero).
        if (gapLength != 0) {
                // If there are gaps, calculate the average gap length.
                averageGapLength = gapLength / consecutiveZeros.length; // Calculate the average gap length.
        } else {
                // If there are no gaps, set the average gap length to 0.
                averageGapLength = 0;
        }
        console.log("Average Gap Length: " + averageGapLength);
        // Calculate and log the score. The formula aims for a normalized score.
        console.log("Average Gap Score: " + (1 - (1 / averageGapLength))); // Give a normalized score.
        // Return the calculated score. If averageGapLength is 0, return 0 to avoid division by zero.
        return (averageGapLength === 0) ? 0 : 1 - (1 / averageGapLength);
}

export function countZeroes() {
        // Initialize a counter for zero slots.
        let zeroCount = 0;
        // Initialize a counter for non-zero (filled) slots.
        let totalCount = 0; // This will actually count non-zero slots first

        // Loop through each key (e.g., room name) in the availabilityGrid object.
        for (const key in availabilityGrid) { // Loops through the rows of the matrix.
                // Loop through each element in the array associated with the current key.
                for (let i = 0; i < availabilityGrid[key].length; i++) { // Loops trough the columns of the matrix.
                        // Check if the current element in the grid is zero.
                        if (availabilityGrid[key][i] === 0) {
                                // If it's zero, increment the zeroCount.
                                zeroCount++; // Increments the zero count if a zero is found.
                        } else {
                                // If it's not zero, increment the totalCount (which is initially counting filled slots).
                                totalCount++; // Increments the total count if a non-zero is found.
                        }
                }
        }

        // Calculate the actual total number of slots by adding zero slots and non-zero slots.
        totalCount = totalCount + zeroCount; // Final count of total slots.

        // Calculate the ratio of filled slots.
        // It's 1 minus the ratio of zero slots to total slots.
        let ratioSlots = 1 - (zeroCount / totalCount); // Ratio of filled slots is calculated by subtracting the ratio of zeroes from 1.
        console.log("Number of zero slots: " + zeroCount + " of total matrix slots " + totalCount);
        console.log("Ratio of filled slots: " + ratioSlots);
}
