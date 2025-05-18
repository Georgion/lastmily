/**
 * This function creates a UTC timestamp from a given date.
 *
 * @param {Date} date - the date from which to create the UTC timestamp
 * @return {number} - the timestamp value
 */
export const createUTCTimestamp = function (date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
};
