/*
 * Rooms are twin sharing: rooms = ceil(travellers / 2). An odd traveller
 * shares with another traveller of the same gender. Copy from the B08 canvas.
 */

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const word = (n: number) => WORDS[n] ?? String(n);

export const roomCount = (travellers: number) => Math.ceil(travellers / 2);

/** "2 adults", "1 adult". */
export function adultsLine(n: number) {
  return `${n} ${n === 1 ? "adult" : "adults"}`;
}

/** "one room", "two rooms". */
export function roomsShort(n: number) {
  const r = roomCount(n);
  return `${word(r)} ${r === 1 ? "room" : "rooms"}`;
}

/** "2 adults · one room". */
export function travellersLine(n: number) {
  return `${adultsLine(n)} · ${roomsShort(n)}`;
}

/** The live-estimate sentence: "You two share one twin room." */
export function roomsSentence(n: number) {
  if (n === 1) return "You share a twin room with a traveller of the same gender.";
  if (n === 2) return "You two share one twin room.";
  const full = Math.floor(n / 2);
  const rooms = `${word(full)[0].toUpperCase()}${word(full).slice(1)} twin ${full === 1 ? "room" : "rooms"}`;
  return n % 2 ? `${rooms}, and one of you shares with another traveller.` : `${rooms}.`;
}
