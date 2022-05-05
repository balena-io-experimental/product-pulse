/**
 * Given Date object, return a YYYY-MM-DD timestamp.
 * @param {Date} date
 * @returns string
 */
const toGitHubQueryDate = (date) => date.toISOString().replace(/T.+Z/, '');

/**
 * Return YYYY-MM-DD timestamp n months ago from current timestamp.
 * @param {number} n
 * @returns string
 */
exports.getNMonthsAgo = (n) => {
    const date = new Date();
    const curMonth = date.getMonth();

    date.setMonth(curMonth - n);
    // If still in same month, set date to last day of previous month
    if (date.getMonth() === curMonth) {
        date.setDate(0);
    }
    date.setHours(0, 0, 0, 0);
    return toGitHubQueryDate(date);
}
