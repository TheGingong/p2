import { jest } from "@jest/globals";
import dayjs from "dayjs"; // Corrected dayjs import based on previous error
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
import {
	calculatePrefScore,
	calculatePrefScoreRandom,
} from "../src/utils/prefScores.js";
import { roomsResourceIdToObject } from "../src/utils/globalVariables.js";
import { wastedSpaceEvaluate } from "../src/utils/wastedSpaceScore.js";
import { locateBestMatches } from "../src/scripts/algorithm.js";

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
describe("wastedSpaceEvaluate", () => {
	// Test case 1: No wasted space (all rooms fully booked)
	it("should return a score indicating minimal waste for fully booked rooms", () => {
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
	it("should return a score indicating maximum waste for completely empty rooms", () => {
		const roomsObject = {
			room1: [0, 0, 0, 0],
			room2: [0, 0, 0, 0],
		};
		expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(0);
	});

	it("should calculate waste score for rooms with simple gaps", () => {
		const roomsObject = {
			room1: [1, 0, 0, 1], // n = 2
			room2: [0, 1, 1, 0], // n = 1, n = 1
		};
		expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(0.5);
	});

	// Test case 4: More complex gaps
	it("should calculate waste score for rooms with multiple gaps", () => {
		const roomsObject = {
			room1: [0, 1, 0, 0, 1, 0], // n=1, n=2, n=1
			room2: [1, 0, 0, 0, 1, 1], // n=3
			room3: [0, 0, 1, 1, 0, 0], // n=2, n=2
		};
		// finalScore = (14/18) * 2 - 1 = (7/9)*2 - 1 = 14/9 - 9/9 = 5/9 = 0.555...
		expect(wastedSpaceEvaluate(roomsObject))
			.toBeCloseTo
			//1 - 1 / 2.5
			();
	});

	// Test case 5: Single room, single day (empty)
	it("should handle a single empty room/day", () => {
		const roomsObject = { room1: [0] }; // n=1
		expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(0);
	});

	// Test case 6: Single room, single day (booked)
	it("should handle a single booked room/day", () => {
		const roomsObject = { room1: [1] }; // n=0
		// zeros = [0] -> Filtered: []
		// score = 0
		// divider = 1 * 1 = 1
		// average = 0 / 1 = 0
		// finalScore = 0 * 2 - 1 = -1
		expect(wastedSpaceEvaluate(roomsObject)).toBe(0);
	});

	// Test case 7: Empty input object
	it("should handle an empty rooms object", () => {
		const roomsObject = {};
		// The function should return -1 for empty input based on the added check
		expect(wastedSpaceEvaluate(roomsObject)).toBe(0);
	});

	// Test case 8: Rooms object with empty days array
	it("should handle a rooms object with an empty days array", () => {
		const roomsObject = { room1: [] };
		// The function should return -1 based on the added check
		expect(wastedSpaceEvaluate(roomsObject)).toBe(0);
	});
	it("should handle a mix of fully booked and fully empty rooms", () => {
		const roomsObject = {
			room1: [1, 1, 1], // n=0
			room2: [0, 0, 0], // n=3
			room3: [1, 0, 1], // n=1
		};
		expect(wastedSpaceEvaluate(roomsObject)).toBeCloseTo(0);
	});
});

describe("prefScoreEvaluate", () => {
	const mockBookingData = [
		{
			checkInDate: "2025-11-21",
			checkOutDate: "2025-11-27",
			guestsNumber: 2,
			stayDuration: 6,
			dayOfBooking: "2025-10-24",
			resourceIds: "0",
			bookingId: 425,
			preference: {
				beds: "s0q1",
				pref9: "opt9.5",
			},
		},
		{
			checkInDate: "2025-03-13",
			checkOutDate: "2025-03-19",
			guestsNumber: 2,
			stayDuration: 6,
			dayOfBooking: "2025-01-29",
			resourceIds: "0",
			bookingId: 426,
			preference: {
				beds: "s2q0",
				pref6: "opt6.4",
				pref8: "opt8.3",
			},
		},
		{
			checkInDate: "2025-01-28",
			checkOutDate: "2025-02-05",
			guestsNumber: 1,
			stayDuration: 8,
			dayOfBooking: "2025-01-21",
			resourceIds: "0",
			bookingId: 429,
			preference: {
				beds: "s1q0",
			},
		},
		{
			checkInDate: "2025-11-14",
			checkOutDate: "2025-11-16",
			guestsNumber: 4,
			stayDuration: 2,
			dayOfBooking: "2025-11-09",
			resourceIds: "0",
			bookingId: 430,
			preference: {
				beds: "s0q2",
			},
		},
		{
			checkInDate: "2025-07-22",
			checkOutDate: "2025-07-29",
			guestsNumber: 1,
			stayDuration: 7,
			dayOfBooking: "2025-06-17",
			resourceIds: "0",
			bookingId: 431,
			preference: {
				beds: "s1q0",
			},
		},
	];
	const mockRoomData = [
		{
			roomNumber: "102",
			roomGuests: 3,
			preference: {
				floor: 1,
				beds: "s1q1",
				pref10: "opt10.2",
			},
		},
		{
			roomNumber: "201",
			roomGuests: 2,
			preference: {
				floor: 2,
				beds: "s0q1",
				pref4: "opt4.1",
				pref8: "opt8.2",
				pref9: "opt9.2",
				pref10: "opt10.1",
			},
		},
		{
			roomNumber: "202",
			roomGuests: 2,
			preference: {
				floor: 2,
				beds: "s0q1",
				pref1: "opt1.3",
				pref3: "opt3.1",
				pref7: "opt7.3",
				pref10: "opt10.4",
			},
		},
		{
			roomNumber: "301",
			roomGuests: 3,
			preference: {
				floor: 3,
				beds: "s1q1",
				pref2: "opt2.2",
				pref5: "opt5.5",
				pref7: "opt7.2",
				pref9: "opt9.5",
			},
		},
		{
			roomNumber: "302",
			roomGuests: 2,
			preference: {
				floor: 3,
				beds: "s0q1",
				pref5: "opt5.5",
				pref7: "opt7.1",
				pref10: "opt10.3",
			},
		},
	];

	it("Should give a preference score from room 102 and bookingId 425", async () => {
		expect(
			await calculatePrefScore(
				mockBookingData[1],
				mockRoomData[1],
				2
			)
		).toBe(0);
	});
	it("BookingData to 0 and RoomData to 2", async () => {
		expect(
			await calculatePrefScore(
				mockBookingData[0],
				mockRoomData[2],
				2
			)
		).toBe(0.5);
	});
          });
