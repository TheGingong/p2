import fs from 'fs/promises'
import { bookingBatches } from "..impartial.js";
import { loadBookings } from '../utils/getInfo';

let database = []
