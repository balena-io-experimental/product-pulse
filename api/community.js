const github = require('./github');
const utils = require('./utils');

// All query results should return newer than MOUNTS_COUNT months
// to not include outdated GitHub stats.
const MONTHS = 3;

const MIN_STARS = 5;
const MIN_FORKS = 5;

const criteria1 = (stars, minStars) => stars >= minStars ? 1 : 0;
const criteria2 = (forks, minForks) => forks >= minForks ? 1 : 0;
const criteria3 = (commits, PRs, contributors) => {
    const notTopContributor = (({ author: { login }}) => !contributors.includes(login));
    const numPRsNotByTopContributors = PRs.filter(notTopContributor).length;
    const numCommitsNotByTopContributors = commits.filter(notTopContributor).length;

    const crit3p1 = utils.percentage(numPRsNotByTopContributors, PRs.length);
    const crit3p2 = utils.percentage(numCommitsNotByTopContributors, commits.length);  

    return utils.roundFloat(utils.average(crit3p1, crit3p2));
}
const criteria4 = (issues, topContributors) => {
    const issuesNotByTopContributors = issues.filter(({ user: { login }}) => !topContributors.includes(login));
    return utils.percentage(issuesNotByTopContributors.length, issues.length);
}

exports.get = async (owner, repo) => {
    // Gather data from GitHub
    const repoData = await github.getRepo(owner, repo);
    const commits = await github.getCommits(owner, repo);
    const { topContributors } = utils.getCoreContributors(commits);
    const PRs = await github.getPRs(owner, repo);
    const issues = await github.getIssues(owner, repo);
    
    return {
        crit1: criteria1(repoData.stargazers_count, MIN_STARS),
        crit2: criteria2(repoData.forks_count, MIN_FORKS),
        crit3: criteria3(commits, PRs, topContributors),
        crit4: criteria4(issues, topContributors),
    };
}
