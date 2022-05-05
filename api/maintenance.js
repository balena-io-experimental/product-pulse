require('dotenv').config()
const { Octokit} = require('@octokit/rest');
// This is imported to throttle requests, but isn't used directly - see plugin-throttling docs for example
const { throttling } = require('@octokit/plugin-throttling');
const { paginateRest } = require('@octokit/plugin-paginate-rest');

const validation = require('./validation');
const { getNMonthsAgo } = require('./utils');

const commits = require('./commits.json');

// Exclude bots from contributor calculations
const GH_BOTS = process.env.GH_BOTS || ['balena-ci', 'renovate-bot'];

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

const getRemoveBotQueryStr = () => {
    const queryArr = GH_BOTS.reduce((qArr, bot) => {
        qArr.push(`NOT(author:${bot})`);
        return qArr;
    }, []);
    return queryArr.join(' ');
}

function sortByAuthor(commits) {
  const authors = new Map();
  commits.forEach(commit => {
    if (authors.has(commit.author.login)) {
      const previous = authors.get(commit.author.login);
      authors.set(commit.author.login, { commits: previous.commits.concat(commit)})
    } else {
      authors.set(commit.author.login, { commits: [commit]})
    }
  });
  return authors 
}

const getCommitsForRepo = async (owner, repo) => {
    const since = getNMonthsAgo(3).toISOString();
    try {
        return commits.maintenance;
        // return await octokit.paginate(octokit.rest.repos.listCommits, {
        //   owner,
        //   repo,
        //   since,
        //   per_page: 100
        // }); 
    } catch (e) {
        console.error('Received error in getCommitsForRepo: ', e);
        throw e;
    }
}

exports.get = async (owner, repo) => {
  const commits = await getCommitsForRepo(owner, repo);
  const authors = sortByAuthor(commits);
  console.log(authors.keys())
  return {
    crit1: 0,
    crit2: 0,
    crit3: 0,
    crit4: 0,
    crit5: 0,
  };
}
