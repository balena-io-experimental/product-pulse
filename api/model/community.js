const utils = require('../utils');

// Criterion 1 (low): Has at least $X stars
const criteria1 = (stars) => stars;

// Criterion 2 (low): Has at least $X forks
const criteria2 = (forks) => forks;

// Criterion 3 (high): X% commits / PRs for past W weeks NOT in core contributors
// TODO: This changes when you change the x value for it, so something may be off
const criteria3 = (commits, PRs, maintainers) => {
    const numPRsNotByMaintainers = PRs.filter(({ user: { login }}) => !maintainers.includes(login)).length;
    const numCommitsNotByMaintainers = commits.filter(({ author: { login }}) => !maintainers.includes(login)).length;
    
    const percentPRs = utils.percentage(numPRsNotByMaintainers, PRs.length);
    const percentCommits = utils.percentage(numCommitsNotByMaintainers, commits.length);

    const score = utils.roundFloat(utils.average(percentPRs, percentCommits)); 
    return score;
}

// Criterion 4 (high): X% issues for past W weeks NOT in core contributors
const criteria4 = (issues, maintainers) => {
    const issuesNotByMaintainers = issues.filter(({ user: { login }}) => !maintainers.includes(login));
    const score = utils.percentage(issuesNotByMaintainers.length, issues.length);
    return score;
}

exports.get = async ({ 
    repo, 
    commits, 
    PRs, 
    issues, 
    maintainers,
    months, 
    cVariables: c
}) => {
    // Process data
    const c1 = (x) => {
        const stars = criteria1(repo.stargazers_count);
        const pass = stars >= x;
        return {
            criterion: 'sentiment',
            description: `Has at least ${x} stars`,
            value: stars,
            score: Number(pass),
            weight: c.weights.c1,
            pass
        }
    }

    const c2 = (x) => {
        const forks = criteria2(repo.forks_count);
        const pass = forks >= x;
        return {
            criterion: 'development',
            description: `Has at least ${x} forks`,
            value: forks,
            score: Number(pass),
            weight: c.weights.c2,
            pass
        }
    }

    const c3 = (x) => {
        const percentCommitsNotByCore = criteria3(commits, PRs, maintainers);
        const pass = percentCommitsNotByCore >= x;
        return {
            criterion: 'contributions',
            description: `${Math.round(x*100)}% of commits and PRs created by users not in core contributors in last ${months} months`,
            value: percentCommitsNotByCore,
            score: percentCommitsNotByCore,
            weight: c.weights.c3,
            pass
        }
    }

    const c4 = (x) => {
        const percentIssuesNotByCore = criteria4(issues, maintainers);
        const pass = percentIssuesNotByCore >= x;
        return {
            criterion: 'engagement',
            description: `${Math.round(x*100)}% of issues created by users not in core contributors in last ${months} months`,
            value: percentIssuesNotByCore,
            score: percentIssuesNotByCore,
            weight: c.weights.c4,
            pass
        }
    }

    const details = [
        c1(c.x.MIN_STARS),
        c2(c.x.MIN_FORKS),
        c3(c.x.PERCENT_EXTERNAL_COMMITS_PRS),
        c4(c.x.PERCENT_EXTERNAL_ISSUES)
    ];

    return {
        score: utils.roundFloat(details.map(c => c.score * c.weight).reduce((total, v) => total + v, 0)),
        details
    };
}
