/**
 * Calculates the color for each of the status
 * @param {Array} issuesAllTime
 * @param {Array} issuesLastMonth
 * @param {Array} pullRequestsLastMonth
 * @returns object containing the status name and its color
 */
export const getModel = (issuesAllTime, issuesLastMonth, pullRequestsLastMonth) => {
    const colors = ['red', 'green', 'yellow'];

    return {
        directed: colors[Math.floor(Math.random() * colors.length)],
        maintained: colors[Math.floor(Math.random() * colors.length)],
        issues: colors[Math.floor(Math.random() * colors.length)]
    }
}