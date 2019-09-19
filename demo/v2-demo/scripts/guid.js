/**
 * Generates a 20 character uuid.
 */
function generateNewGuid() {
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now();
  }
  return 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // Generate a random number, scaled from 0 to 16.
    // Bitwise-and by 15 since we only care about the last 4 bits.
    const r = (d + Math.random() * 16) & 15 | 0;

    // Shift 4 times to divide by 16
    d >>= 4;
    return r.toString(16);
  });
}