require('dotenv').config()
const { Octokit} = require('@octokit/rest');
// This is imported to throttle requests, but isn't used directly - see plugin-throttling docs for example
const { throttling } = require('@octokit/plugin-throttling');
const { paginateRest } = require('@octokit/plugin-paginate-rest');
const moment = require('moment');

const { getNMonthsAgo } = require('./utils');

// Exclude bots from contributor calculations
const GH_BOTS = process.env.GH_BOTS || ['balena-ci', 'renovate-bot', 'Balena CI', 'bulldozer-balena[bot]'];

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

function isBot(author) {
  return GH_BOTS.includes(author);
}

function sortByAuthor(commits) {
  const authors = new Map();
  commits.forEach(commit => {
    const author = commit.commit.author.name;
    if (authors.has(author)) {
      const previous = authors.get(author);
      authors.set(author, { commits: previous.commits.concat(commit)})
    } else {
      authors.set(author, { commits: [commit]})
    }
  });
  return authors 
}

function getCoreContributors(commits) {
  // TODO acually do this...
  const authors = sortByAuthor(commits);
  return ['20k-ultra', 'cywang117', 'pipex']
}

async function getCommitsForRepo (owner, repo, monthRange) {
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

async function fileExists(owner, repo, path) {
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

/**
 * Given a GitHub owner and repo, return a count of issues categorized by open & closed.
 * @param {string} owner 
 * @param {string} repo
 * @param {string} type One of 'issue' or 'pr'
 * @returns {Object}: An object with 'closed' and 'open' keys and numeric values
 */
async function getIssues (owner, repo, monthRange, filter) {
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

function criterion1(commits, x, w) {
  return commits.filter(commit => moment(commit.commit.author.date).isAfter(moment().subtract(w, 'weeks'))).length > x;
}

function criterion2(issues, x) {
  const open = issues.filter(i => i.state === 'open')
  const closed = issues.filter(i => i.state === 'closed')
  return (open + closed / open) < x;
}

function criterion3(issues, x) {
  const hasLabels = issues.filter(issue => issue.labels.length > 0);
  return (hasLabels.length / issues.length ) > x;
}

async function criterion4(maintainerCommented, issues, x) {
  return maintainerCommented.length / issues.length > x; 
}

function criterion5(architecureDocExists) {
  return architecureDocExists === true;
}

exports.get = async (owner, repo) => {
  const MONTHS = 3;
  const commits = await getCommitsForRepo(owner, repo, MONTHS);
  const issues = await getIssues(owner, repo, MONTHS);
  const maintainers = getCoreContributors(commits);
  const maintainersFilter = maintainers.reduce((f, m) => {
    f.push(`commenter:${m}`)
    return f;
  }, []).join(' ');
  const maintainerCommented = await getIssues(owner, repo, MONTHS, maintainersFilter);
  const archMdExists = await fileExists(owner, repo, 'ARCHITECTURE.md');

  return {
    crit1: criterion1(commits, 1, 4), // Has had X commits in W weeks
    crit2: criterion2(issues, 0.5), // Open/closed issue ratio is less than X%
    crit3: criterion3(issues, 0.2), // X% of issues have labels
    crit4: await criterion4(maintainerCommented, issues, 0.7), // X% of issues have responses from C contributors
    crit5: criterion5(archMdExists), // Contains an ARCHITECTURE.md
  };
}
