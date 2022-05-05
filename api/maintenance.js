require('dotenv').config()
const { Octokit} = require('@octokit/rest');
// This is imported to throttle requests, but isn't used directly - see plugin-throttling docs for example
const { throttling } = require('@octokit/plugin-throttling');
const { paginateRest } = require('@octokit/plugin-paginate-rest');
const moment = require('moment');

const github = require('./github');
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

function getCoreContributors(commits) {
  // TODO acually do this...
  const authors = utils.sortByAuthor(commits);
  return ['20k-ultra', 'cywang117', 'pipex']
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
  const commits = await github.getCommitsForRepo(owner, repo, MONTHS);
  const issues = await github.getIssues(owner, repo, MONTHS);
  const maintainers = getCoreContributors(commits);
  const maintainersFilter = maintainers.reduce((f, m) => {
    f.push(`commenter:${m}`)
    return f;
  }, []).join(' ');
  const maintainerCommented = await github.getIssues(owner, repo, MONTHS, maintainersFilter);
  const archMdExists = await github.fileExists(owner, repo, 'ARCHITECTURE.md');

  return {
    crit1: criterion1(commits, 1, 4), // Has had X commits in W weeks
    crit2: criterion2(issues, 0.5), // Open/closed issue ratio is less than X%
    crit3: criterion3(issues, 0.2), // X% of issues have labels
    crit4: await criterion4(maintainerCommented, issues, 0.7), // X% of issues have responses from C contributors
    crit5: criterion5(archMdExists), // Contains an ARCHITECTURE.md
  };
}
