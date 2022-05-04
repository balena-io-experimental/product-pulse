export const getModel = (issuesAllTime, issuesLastMonth, pullRequestsLastMonth) => {
    const colors = ['red', 'green', 'yellow'];

    return {
        directed: colors[Math.floor(Math.random() * colors.length)],
        maintained: colors[Math.floor(Math.random() * colors.length)],
        issues: colors[Math.floor(Math.random() * colors.length)]
    }
}