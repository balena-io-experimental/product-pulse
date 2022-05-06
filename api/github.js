require('dotenv').config()
const { Octokit} = require('@octokit/rest');
// This is imported to throttle requests, but isn't used directly - see plugin-throttling docs for example
// eslint-disable-next-line
const { throttling } = require('@octokit/plugin-throttling');
const { paginateRest } = require('@octokit/plugin-paginate-rest');
const fetch = require('node-fetch');

const utils = require('./utils');

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
 * Given a GitHub owner and repo, check whether repo is accessible/exists.
 * @param {string} owner
 * @param {string} repo 
 * @returns {boolean}
 */
exports.isAccessibleRepo = async (owner, repo) => {
    try {
        const response = await fetch(`https://github.com/${owner}/${repo}`);
        return response.ok;
    } catch (e) {
        console.error('Received error in isAccessibleRepo: ', e);
        return false;
    }
}

exports.getRepo = async (owner, repo) => {
  try {
      const { data: { items } } = await octokit.search.repos({
          q: `repo:${owner}/${repo} `,
          per_page: 1
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

exports.getCommits = async (owner, repo, monthRange) => {
  const since = utils.getNMonthsAgo(monthRange).toISOString();
  try {
    return await octokit.paginate(octokit.repos.listCommits, {
      owner,
      repo,
      since,
      per_page: 100
    });
  } catch (e) {
    console.error('Received error in getCommits: ', e);
    throw e;
  }
}

exports.getIssues = async (owner, repo, monthRange, queryExtra) => {
  const date = utils.toGitHubQueryDate(utils.getNMonthsAgo(monthRange));
  try {
    const queryBase = `type:issue repo:${owner}/${repo} updated:>=${date}`;
    return await octokit.paginate(octokit.search.issuesAndPullRequests, {
      q: `${queryBase}${queryExtra ? ' ' : ''}${queryExtra}`,
      sort: 'updated',
      per_page: 100
    });
  } catch (e) {
    console.error('Received error in getIssues: ', e);
    throw e;
  }
}

exports.getPRs = async (owner, repo, monthRange) => {
    const since = utils.getNMonthsAgo(monthRange).toISOString();
    try {
        return await octokit.paginate(octokit.pulls.list, {
            owner,
            repo,
            since,
            sort: 'updated',
            per_page: 100
        });
    } catch (e) {
        console.error('Received error in getPRs: ', e);
        throw e;
    }
}
