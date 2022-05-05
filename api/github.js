require('dotenv').config()
const { Octokit} = require('@octokit/rest');
// This is imported to throttle requests, but isn't used directly - see plugin-throttling docs for example
const { throttling } = require('@octokit/plugin-throttling');
const { paginateRest } = require('@octokit/plugin-paginate-rest');
const fetch = require('node-fetch');
require('dotenv').config();

const validation = require('./validation');
const { getNMonthsAgo } = require('./utils');

// All query results should return newer than MOUNTS_COUNT months
// to not include outdated GitHub stats.
const MONTHS = 3;

// Exclude bots from contributor calculations
const GH_BOTS = process.env.GH_BOTS || ['balena-ci', 'renovate-bot', 'Balena CI', 'bulldozer-balena[bot]'];

// A set of options to pass to Octokit instance when you only 
// care about the count of the results, to speed up query.
const COUNT_OPTIONS = { per_page: 1 };

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
const getOwnerAndRepo = (gitHubUri) => {
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
const isAccessibleRepo = async (owner, repo) => {
    try {
        const response = await fetch(`https://github.com/${owner}/${repo}`);
        return response.ok;
    } catch (e) {
        console.error('Received error in isAccessibleRepo: ', e);
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
  const date = getNMonthsAgo(MONTHS);

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
    return { forks: forks_count, stars: stargazers_count, watchers: watchers_count };
  } catch (e) {
    console.error('Received error in getRepoEngagementCount: ', e);
    throw e;
  }
}

const isBot = (author) => {
  return GH_BOTS.includes(author);
}
const getRemoveBotQueryStr = () => {
  const queryArr = GH_BOTS.reduce((qArr, bot) => {
    qArr.push(`NOT(author:${bot})`);
    return qArr;
  }, []);
  return queryArr.join(' ');
}

const getCommitsForRepo = async (owner, repo) => {
  const since = getNMonthsAgo(MONTHS).toISOString();
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

const getPRsForRepo = async (owner, repo) => {
  const since = getNMonthsAgo(MONTHS).toISOString();
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

const getTopContributors = async (commits) => {
  try {
    const commitCount = commits.length;

    const commitsPerContributor = commits
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

const getContributingFileSize = async (owner, repo) => {
  try {
    const {data} =  await octokit.repos.getContent({owner, repo, path: 'CONTRIBUTING.md'}); 
    return data.size;
  } catch (e) {
    if (e.status === 404) {
      return 0;
    }
    console.error('Received error in getContributingFileSize: ', e);
    throw e;
  }
}

const fileExists = async (owner, repo, path) => {
  try {
    await octokit.repos.getContent({
      owner,
      repo,
      path
    })
  } catch (e) {
    switch (e.status) {
      case 404:
        return false;
      default:
        console.error(e)
        throw e;
    }
  }
  return true;
}

const getCommits = async (owner, repo, monthRange) => {
  const since = getNMonthsAgo(monthRange).toISOString();
  try {
    return await octokit.paginate(octokit.rest.repos.listCommits, {
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

const getIssues = async (owner, repo, monthRange, filter) => {
  const date = getNMonthsAgo(monthRange).toISOString();
  try {
    const queryBase = `type:issue repo:${owner}/${repo} updated:>=${date}`;
    const { data } = await octokit.search.issuesAndPullRequests({
      q: `${queryBase} ${filter}`,
      per_page: 100
    });
    return data.items;
  } catch (e) {
    console.error('Received error in getIssueOrPRCount: ', e);
    throw e;
  }
}

module.exports = {
  isAccessibleRepo,
  fileExists,
  getIssues,
  getCommits,
  getContributingFileSize, // duplicate of fileExists
  getTopContributors,
  getPRsForRepo,
  getIssueOrPRCount, // duplicate of getIssues
  getCommitsForRepo, // duplicate of getCommits
  getOwnerAndRepo,
  getRepoEngagementCount,
  getRemoveBotQueryStr,
}
