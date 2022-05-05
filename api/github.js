const { Octokit} = require('@octokit/rest');
// This is imported to throttle requests, but isn't used directly - see plugin-throttling docs for example
const { throttling } = require('@octokit/plugin-throttling');
const { paginateRest } = require('@octokit/plugin-paginate-rest');

const validation = require('./validation');
const { getNMonthsAgo } = require('./utils');

// All query results should return newer than MOUNTS_COUNT months
// to not include outdated GitHub stats.
const MONTHS_COUNT = 3;

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
 * Given a valid GitHub URI, return its owner and repository
 * @param {string} gitHubUri 
 * @returns {Array[string, string]}
 */
exports.getOwnerAndRepo = (gitHubUri) => {
    if (!validation.isGitHubUri(gitHubUri)) {
        return;
    }

    const matchingRegex = validation.OWNER_REPO_REGEX.test(gitHubUri) ? 
        validation.OWNER_REPO_REGEX : 
        validation.GITHUB_URL_REGEX;

    const [, owner, repo] = gitHubUri.match(matchingRegex);
    return [owner, repo];
}

/**
 * Given a GitHub owner and repo, check whether repo is accessible/exists.
 * @param {string} owner
 * @param {string} repo 
 * @returns {boolean}
 */
exports.isAccessibleRepo = async (owner, repo) => {
    try {
        const response = await octokit.rest.repos.get({
            owner,
            repo
        });
        const isAccessible = response.status === 200;

        if (isAccessible) {
            const { data } = response;
            memo[data.full_name] = data;
            console.log(memo);
        }

        return isAccessible;
    } catch (e) {
        return false;
    }
}

/**
 * Given a GitHub owner and repo, return a count of issues categorized by open & closed.
 * @param {string} owner 
 * @param {string} repo
 * @param {string} type One of 'issue' or 'pr'
 * @returns {Object}: An object with 'closed' and 'open' keys and numeric values
 */
const VALID_TYPES = ['issue', 'pr'];
const getIssueOrPRCount = async (owner, repo, type) => {
    if (!VALID_TYPES.includes(type)) {
        console.error(`Expected one of ${VALID_TYPES.join(', ')} for type, got ${type}`);
        return;
    }
    const date = getNMonthsAgo(MONTHS_COUNT);

    try {
        const queryBase = `type:${type} repo:${owner}/${repo} updated:>=${date}`;
        const prQueryStrings = ['is:closed', 'is:open'];
        const issueQueryStrings = ['is:closed', 'no:label'];

        const { data: { total_count: closed }} = await octokit.search.issuesAndPullRequests({
            q: `${queryBase} is:closed`,
            ...COUNT_OPTIONS
        });

        const { data: { total_count: open }} = await octokit.search.issuesAndPullRequests({
            q: `${queryBase} is:open`,
            ...COUNT_OPTIONS
        });

        return { closed, open };
    } catch (e) {
        console.error('Received error in getIssueOrPRCount: ', e);
        throw e;
    }
}

/**
 * Given a valid owner and repo, return star, fork, and watcher count
 * @param {string} owner 
 * @param {string} repo 
 */
const getRepoEngagementCount = async (owner, repo) => {
    try {
        const { data: { items } } = await octokit.search.repos({
            q: `repo:${owner}/${repo} `,
            ...COUNT_OPTIONS
        });

        if (!items || !items.length) {
            throw new Error(`Could not get engagement data for repo ${owner}/${repo}`);
        }

        const { forks_count, stargazers_count, watchers_count } = items[0];
        return { forks_count, stargazers_count, watchers_count };
    } catch (e) {
        console.error('Received error in getRepoEngagementCount: ', e);
        throw e;
    }
}

const getRemoveBotQueryStr = () => {
    const queryArr = GH_BOTS.reduce((qArr, bot) => {
        qArr.push(`NOT(author:${bot})`);
        return qArr;
    }, []);
    return queryArr.join(' ');
}

const getCommitsForRepo = async (owner, repo) => {
    const date = getNMonthsAgo(3);

    try {
        const data = await octokit.paginate(octokit.search.commits, {
            q: `repo:${owner}/${repo} author-date:>=${date} merge:false ${getRemoveBotQueryStr()}`,
            per_page: 100
        });

        console.log(data);

        return data;
    } catch (e) {
        console.error('Received error in getCommitsForRepo: ', e);
        throw e;
    }
}

const getTopContributors = async (owner, repo) => {
    try {
        const rawCommits = await getCommitsForRepo(owner, repo);
        const commitCount = rawCommits.length;

        const commitsPerContributor = rawCommits
            .map(({ author }) => author.login)
            .reduce((countMap, login) => {
                if (!countMap[login]) {
                    countMap[login] = 1;
                } else {
                    countMap[login]++;
                }
                return countMap;
            }, {});

        const numContributors = Object.keys(commitsPerContributor).length;

        const averageCommitCount = Math.floor(commitCount / numContributors);

        const topContributors = commitsPerContributor
            .filter(([, numCommits ]) => numCommits >= averageCommitCount)
            .map(([ login ]) => login);

        const otherContributors = commitsPerContributor
            .filter(([, numCommits]) => numCommits < averageCommitCount)
            .map(([ login ]) => login);

        return { topContributors, otherContributors };
    } catch (e) {
        console.error('Received error in getTopContributors: ', e);
        throw e;
    }
}

const hasCommitInTimePeriod = async (owner, repo) => {
// Check if memoized commit array is not empty
}

// issues open:closed ratio
// issues label:nolabel ratio (where label was added)
// repo has CONTRIBUTING.md
// repo has ARCHITECTURE.md
// PRs not made by topContributors
// Commits not made by topContributors

async function maintenance() {
  return {
    crit1: 0,
    crit2: 0,
    crit3: 0,
    crit4: 0,
    crit5: 0,
  };
}

async function direction() {
  return {
    crit1: 0,
    crit2: 0,
    crit3: 0,
    crit4: 0,
  };
}

async function community() {
  return {
    crit1: 0,
    crit2: 0,
    crit3: 0,
    crit4: 0,
  };
}

exports.calculateModel = async (owner, repo) => {

  // Collect data for all the algorithms
  const commits = await getCommitsForRepo(owner,repo);
  // add more...
 

  // Apply individual algorithms
  const mData = await maintenance(commits);
  const dData = await direction(commits);
  const cData = await community(commits);

  return {
    maintenance: 0.05, // average the mData 
    direction: 0.15, // average the dData
    community: 0.5, // average the cData
  };
}
