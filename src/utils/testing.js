import dayjs from 'dayjs';

const today = dayjs(); // Creates a dayjs object for right now

let jan = today.month(0)
let added = jan.add(2, 'month');
let enddate = today.add(38, 'day')


let randomMonthIndex = Math.floor(Math.random() * 12);

let randomDateIndex = Math.ceil((Math.random() * 28));
let checkInDay = dayjs().date(randomDateIndex);
//console.log(checkInDay.format('DD'));



const date = dayjs('${}-04-04'); // YYYY-MM-DD
console.log(specificDate.format('YYYY-MM-DD'));