require('dotenv').config()
const { Octokit} = require('@octokit/rest');
// This is imported to throttle requests, but isn't used directly - see plugin-throttling docs for example
const { throttling } = require('@octokit/plugin-throttling');
const { paginateRest } = require('@octokit/plugin-paginate-rest');
require('dotenv').config('./.env');

const utils = require('./utils');

// All query results should return newer than MOUNTS_COUNT months
// to not include outdated GitHub stats.
const MONTHS = 3;

// Exclude bots from contributor calculations
const GH_BOTS = process.env.GH_BOTS || ['balena-ci', 'renovate-bot'];

// A set of options to pass to Octokit instance when you only 
// care about the count of the results, to speed up query.
const COUNT_OPTIONS = { per_page: 1 };

// TODO: memoizee (would only help in production where webpack-dev-server
// doesn't hot-reload the page with every change)
const memo = {};

/**
 * Setup GitHub REST API client
 */
const MyOctokit = Octokit.plugin(paginateRest);
const octokit = new MyOctokit({
    auth: `${process.env.GITHUB_TOKEN}`,
    userAgent: 'ProcessPulse v1.0.0',
    throttle: {
        onRateLimit: (retryAfter, options) => {
            octokit.log.warn(
                `Request quota exhausted for request ${options.method} ${options.url}`
            );
            
            // Retry twice after hitting a rate limit error, then give up.
            // Don't retry with stale requests older than 5 seconds.
            if (options.request.retryCount <= 2 && retryAfter <= 5) {
                console.log(`Retrying after ${retryAfter} seconds!`);
                return true;
            }
        },
        onAbuseLimit: (_retryAfter, options) => {
            // does not retry, only logs a warning
            octokit.log.warn(
                `Abuse detected for request ${options.method} ${options.url}`
            );
        }
    }
});

/**
 * Given a valid owner and repo, return star, fork, and watcher count
 * @param {string} owner 
 * @param {string} repo 
 */
const getRepo = async (owner, repo) => {
    try {
        const { data: { items } } = await octokit.search.repos({
            q: `repo:${owner}/${repo} `,
            ...COUNT_OPTIONS
        });

        if (!items || !items.length) {
            throw new Error(`Could not get engagement data for repo ${owner}/${repo}`);
        }
        return items[0];
    } catch (e) {
        console.error('Received error in getRepo: ', e);
        throw e;
    }
}

const getIssues = async (owner, repo) => {
    const since = utils.getNMonthsAgo(MONTHS).toISOString();
    try {
        const data = await octokit.paginate(octokit.issues.listForRepo, {
            owner,
            repo,
            since,
            per_page: 100
        });
        return data;
    } catch (e) {
        console.error('Received error in getIssues: ', e);
        throw e;
    }
}

const getCommits = async (owner, repo) => {
    const since = utils.getNMonthsAgo(MONTHS).toISOString();
    try {
        return await octokit.paginate(octokit.repos.listCommits, {
          owner,
          repo,
          since,
          per_page: 100
        });
    } catch (e) {
        console.error('Received error in getCommitsForRepo: ', e);
        throw e;
    }
}

const getPRs = async (owner, repo) => {
    const since = utils.getNMonthsAgo(MONTHS).toISOString();
    try {
        return await octokit.paginate(octokit.pulls.list, {
            owner,
            repo,
            since,
            sort: 'created',
            per_page: 100
        });
    } catch (e) {
        console.error('Received error in getPRsForRepo: ', e);
        throw e;
    }
}

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
    const repoData = await getRepo(owner, repo);
    const commits = await getCommits(owner, repo);
    const { topContributors } = utils.getCoreContributors(commits);
    const PRs = await getPRs(owner, repo);
    const issues = await getIssues(owner, repo);
    
    return {
        crit1: criteria1(repoData.stargazers_count, MIN_STARS),
        crit2: criteria2(repoData.forks_count, MIN_FORKS),
        crit3: criteria3(commits, PRs, topContributors),
        crit4: criteria4(issues, topContributors),
    };
}
