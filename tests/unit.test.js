// __tests__/availabilityMatrix.test.js

import { jest } from "@jest/globals";
import dayjs from "dayjs";
import {
	bookingRange,
	dateIndex,
	dateDifference,
	extendGrid,
	insertBookings,
	checkAvailability,
          clearMatrix,
	resetMatrix,
	getAvailabilityGridForTesting,
	setTempMinForTesting,
	getTempMinForTesting,
} from "../src/scripts/availabilityMatrix.js";
import { wastedSpaceEvaluate } from "../src/utils/wastedSpaceScore.js";

describe("availabilityMatrix module", () => {
	const FIXED_TODAY = "2025-05-01";

	beforeEach(() => {
		// reset the internal “today” and temp_min, and clear any existing grid
		setTempMinForTesting(FIXED_TODAY);
		clearMatrix();
	});

	describe("dateIndex & dateDifference", () => {
		it("dateIndex returns days from today", () => {
			// FIXED_TODAY = May 1, 2025
			expect(dateIndex("2025-05-01")).toBe(0);
			expect(dateIndex("2025-05-03")).toBe(2);
			expect(dateIndex("2025-04-29")).toBe(-2);
		});

		it("dateDifference returns absolute difference", () => {
			expect(
				dateDifference(
					"2025-05-01",
					"2025-05-05"
				)
			).toBe(4);
			expect(
				dateDifference(
					"2025-05-05",
					"2025-05-01"
				)
			).toBe(-4);
		});
	});

	describe("bookingRange", () => {
		it("returns days from temp_min to the latest checkOutDate and updates temp_min", () => {
			// initial temp_min = today = May 1
			const bookings1 = [
				{ checkOutDate: "2025-05-03" },
				{ checkOutDate: "2025-05-05" },
			];
			const r1 = bookingRange(bookings1);
			expect(r1).toBe(4); // May 1 → May 5
			expect(
				getTempMinForTesting().format(
					"YYYY-MM-DD"
				)
			).toBe("2025-05-05");

			// second call: only one new booking to May 7: diff from May 5 → May 7 = 2
			const bookings2 = [
				{ checkOutDate: "2025-05-07" },
			];
			const r2 = bookingRange(bookings2);
			expect(r2).toBe(2);
			expect(
				getTempMinForTesting().format(
					"YYYY-MM-DD"
				)
			).toBe("2025-05-07");
		});

		it("returns 0 if no booking is after temp_min", () => {
			// temp_min = May 1
			const bookings = [{ checkOutDate: "2025-04-30" }];
			const r = bookingRange(bookings);
			expect(r).toBe(0);
			expect(
				getTempMinForTesting().format(
					"YYYY-MM-DD"
				)
			).toBe("2025-05-01");
		});
	});

	describe("extendGrid", () => {
		const rooms = [
			{ roomNumber: "101" },
			{ roomNumber: "102" },
		];

		it("does nothing if date_range is 0", () => {
			extendGrid(rooms, 0);
			expect(getAvailabilityGridForTesting()).toEqual(
				{}
			);
		});

		it("creates a new grid of zeros when empty", () => {
			extendGrid(rooms, 3);
			const grid = getAvailabilityGridForTesting();
			expect(Object.keys(grid)).toEqual(["101", "102"]);
			expect(grid["101"]).toEqual([0, 0, 0]);
			expect(grid["102"]).toEqual([0, 0, 0]);
		});

		it("appends new columns on subsequent calls", () => {
                              resetMatrix();
			extendGrid(rooms, 2);
			extendGrid(rooms, 3);
			const grid = getAvailabilityGridForTesting();
			// after first: length=2; after second: length=5
			expect(grid["101"].length).toBe(5);
			expect(grid["101"].slice(0, 2)).toEqual([0, 0]);
			expect(grid["101"].slice(2)).toEqual([0, 0, 0]);
		});
	});

	describe("insertBookings", () => {
		it("marks start (sID), middle (ID), and end (eID) correctly", () => {
			// prepare grid for room 101, 4 days long
			const grid = { 101: [0, 0, 0, 0] };
			const booking = {
				checkInDate: "2025-05-02", // index=1
				checkOutDate: "2025-05-04", // index=3
				resourceIds: "101",
				bookingId: "B1",
				stayDuration: 2,
			};

			const result = insertBookings([booking], grid);
			// index 1: "sB1"
			expect(result["101"][1]).toBe("sB1");
			// index 2: "eB1" (middle loop doesn't run; end fills index=2)
			expect(result["101"][2]).toBe("eB1");
			// other slots untouched
			expect(result["101"][0]).toBe(0);
			expect(result["101"][3]).toBe(0);
		});

		it("skips unknown rooms without throwing", () => {
			const grid = { 101: [0, 0, 0] };
			const booking = {
				checkInDate: "2025-05-02",
				checkOutDate: "2025-05-03",
				resourceIds: "999", // not in grid
				bookingId: "X",
				stayDuration: 1,
			};
			expect(() =>
				insertBookings([booking], grid)
			).not.toThrow();
			// grid unchanged
			expect(grid["101"]).toEqual([0, 0, 0]);
		});
	});

	describe("checkAvailability & clearMatrix", () => {
		it("returns 1 for past dates, or occupied cells, 0 for free", () => {
			// today = May 1. any date before → 1
			const grid = { 101: [0, "sB1", 0] };
			expect(
				checkAvailability(
					"101",
					"2025-04-30",
					grid
				)
			).toBe(1);
			// index=1 occupied
			expect(
				checkAvailability(
					"101",
					"2025-05-02",
					grid
				)
			).toBe(1);
			// index=2 is 0
			expect(
				checkAvailability(
					"101",
					"2025-05-03",
					grid
				)
			).toBe(0);
		});

		it("clearMatrix zeroes out everything", () => {
                              resetMatrix();
			const rooms = [{ roomNumber: "101" }];
			extendGrid(rooms, 2);
			const grid = getAvailabilityGridForTesting();
			expect(
				getAvailabilityGridForTesting()["101"]
			).toEqual([0, 0]);
		});
	});
});
describe('wastedSpaceEvaluate', () => {
  // Test case 1: No wasted space (all rooms fully booked)
  it('should return a score indicating minimal waste for fully booked rooms', () => {
    const roomsObject = {
      room1: [1, 1, 1, 1],
      room2: [1, 1, 1, 1],
    };
    // Expectation: consecutiveZeros will contain only 0s.
    // The modified function avoids 1/0. Score should be 0.
    // Final score = (0 / (4*2)) * 2 - 1 = -1
    expect(wastedSpaceEvaluate(roomsObject)).toBe(0);
  });

  // Test case 2: All rooms completely empty
  it('should return a score indicating maximum waste for completely empty rooms', () => {
    const roomsObject = {
      room1: [0, 0, 0, 0], 
      room2: [0, 0, 0, 0], 
    };
    expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(1);
  });

  it('should calculate waste score for rooms with simple gaps', () => {
    const roomsObject = {
      room1: [1, 0, 0, 1], // n = 2
      room2: [0, 1, 1, 0], // n = 1, n = 1
    };
     expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(1);
  });

    // Test case 4: More complex gaps
    it('should calculate waste score for rooms with multiple gaps', () => {
        const roomsObject = {
            room1: [0, 1, 0, 0, 1, 0], // n=1, n=2, n=1
            room2: [1, 0, 0, 0, 1, 1], // n=3
            room3: [0, 0, 1, 1, 0, 0], // n=2, n=2
        };
        // room1: zeros = [1, 2, 1]
        // room2: zeros = [0, 3, 0] -> Filtered: [3]
        // room3: zeros = [2, 0, 2] -> Filtered: [2, 2]
        // All zeros > 0: [1, 2, 1, 3, 2, 2]
        // score = (1/1)^2 + (1/2)^2 + (1/1)^2 + (1/3)^2 + (1/2)^2 + (1/2)^2
        // score (XOR) = 3 + 2 + 3 + (0.333...)^2 + 2 + 2
        // score (XOR) = 3 + 2 + 3 + 2 + 2 + 2 = 14
        // divider = 6 * 3 = 18
        // average = 14 / 18 = 0.777...
        // finalScore = (14/18) * 2 - 1 = (7/9)*2 - 1 = 14/9 - 9/9 = 5/9 = 0.555...
        expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(5 / 9);
    });


  // Test case 5: Single room, single day (empty)
  it('should handle a single empty room/day', () => {
    const roomsObject = { room1: [0] }; // n=1
    // zeros = [1]
    // score = (1/1)^2 = 3
    // divider = 1 * 1 = 1
    // average = 3 / 1 = 3
    // finalScore = 3 * 2 - 1 = 5
    expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(5);
  });

  // Test case 6: Single room, single day (booked)
  it('should handle a single booked room/day', () => {
    const roomsObject = { room1: [1] }; // n=0
    // zeros = [0] -> Filtered: []
    // score = 0
    // divider = 1 * 1 = 1
    // average = 0 / 1 = 0
    // finalScore = 0 * 2 - 1 = -1
    expect(wastedSpaceEvaluate(roomsObject)).toBe(-1);
  });

  // Test case 7: Empty input object
  it('should handle an empty rooms object', () => {
    const roomsObject = {};
    // The function should return -1 for empty input based on the added check
    expect(wastedSpaceEvaluate(roomsObject)).toBe(-1);
  });

    // Test case 8: Rooms object with empty days array
    it('should handle a rooms object with an empty days array', () => {
        const roomsObject = { room1: [] };
        // The function should return -1 based on the added check
        expect(wastedSpaceEvaluate(roomsObject)).toBe(-1);
    });

    // Test case 9: Mixed rooms, including fully booked and fully empty
    it('should handle a mix of fully booked and fully empty rooms', () => {
        const roomsObject = {
            room1: [1, 1, 1], // n=0
            room2: [0, 0, 0], // n=3
            room3: [1, 0, 1], // n=1
        };
        // room1: zeros = [0, 0, 0] -> Filtered: []
        // room2: zeros = [3]
        // room3: zeros = [0, 1, 0] -> Filtered: [1]
        // All zeros > 0: [3, 1]
        // score = (1/3)^2 + (1/1)^2
        // score (XOR) = 2 + 3 = 5
        // divider = 3 * 3 = 9
        // average = 5 / 9
        // finalScore = (5/9) * 2 - 1 = 10/9 - 9/9 = 1/9 = 0.111...
        expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(1 / 9);
    });

});