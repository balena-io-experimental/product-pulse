const github = require('../github');
const utils = require('../utils');
const maintenance = require('./maintenance');
const direction = require('./direction');
const community = require ('./community');

const fs = require('fs');

exports.calculate = async (owner, repo) => {
  // Assign consts and thresholds
  const MONTHS = 3;
  const mVariables = {
    x: {
      NUM_COMMITS_IN_WEEKS: [1, 4],
      PERCENT_OPEN_ISSUES: 0.5,
      PERCENT_ISSUES_WITH_LABEL: 0.2,
      PERCENT_ISSUES_WITH_RESPONSE: 0.7
    },
    weights: {
      c1: 0.35,
      c2: 0.3,
      c3: 0.05,
      c4: 0.15,
      c5: 0.15
    }
  };
  const dVariables = {
    x: {
      PERCENT_PRS_REVIEWED_COMMENTED: 0.5,
      PERCENT_INTERNAL_COMMITS: 0.8,
      NUM_ISSUES_ASSIGNED: 0
    },
    weights: {
      c1: 0.1,
      c2: 0.5,
      c3: 0.3,
      c4: 0.1,
    }
  };
  const cVariables = {
    x: {
      MIN_STARS: 5,
      MIN_FORKS: 5,
      PERCENT_EXTERNAL_COMMITS_PRS: 0.15,
      PERCENT_EXTERNAL_ISSUES: 0.3
    },
    weights: {
      c1: 0.25,
      c2: 0.1,
      c3: 0.325,
      c4: 0.325
    }
  };

  // Collect data once for all the algorithms
  // const repoData = await github.getRepo(owner, repo);
  const repoData = JSON.parse(await fs.promises.readFile('./sample-repo-data.json', 'utf-8'));
  
  // const rawCommits = await github.getCommits(owner, repo, MONTHS);
  const rawCommits = JSON.parse(await fs.promises.readFile('./sample-raw-commits.json', 'utf-8'));
  
  // const rawIssues = await github.getIssues(owner, repo, MONTHS);
  const rawIssues = JSON.parse(await fs.promises.readFile('./sample-raw-issues.json', 'utf-8'));

  // const rawPRs = await github.getPRs(owner, repo, MONTHS);
  const rawPRs = JSON.parse(await fs.promises.readFile('./sample-raw-prs.json', 'utf-8'));
  
  // Filter out bots
  // TODO: deduplicate
  const commits = rawCommits.filter(({ author }) => author && author.login && !utils.isBot(author.login));
  const issues = rawIssues.filter(({ user }) => user && user.login && !utils.isBot(user.login));
  const PRs = rawPRs.filter(({ user }) => user && user.login && !utils.isBot(user.login));

  const maintainers = utils.getCoreContributors(commits, owner, repo);
  
  // Data needed for maintenance
  const commentedQuery = maintainers.reduce((f, m) => {
    f.push(`commenter:${m}`);
    return f;
  }, []).join(' ');
  const maintainerCommentedIssues = [] || await github.getIssues(owner, repo, MONTHS, commentedQuery);
  const archMdExists = (await github.getFileSize(owner, repo, 'ARCHITECTURE.md')) > 0;

  // Data needed for direction
  const contributingMdExists = (await github.getFileSize(owner, repo, 'CONTRIBUTING.md')) > 0;
  const involvesQuery = maintainers.reduce((f, m) => {
    f.push(`involves:${m}`);
    return f;
  }, []).join(' ');
  const maintainerCommentedReviewedPRs = [] || await github.getPRs(owner, repo, MONTHS, involvesQuery);

  // Apply individual algorithms
  const mData = await maintenance.get({ 
    commits, 
    issues, 
    maintainerCommentedIssues, 
    archMdExists,
    months: MONTHS,
    mVariables
  });
  // return JSON.stringify(mData, null, 2);

  const dData = await direction.get({
    issues,
    contributingMdExists,
    PRs,
    maintainerCommentedReviewedPRs,
    maintainers,
    commits,
    dVariables
  });
  // return JSON.stringify(dData, null, 2);
  
  const cData = await community.get({
    repo: repoData,
    commits,
    PRs,
    issues,
    maintainers,
    cVariables
  });
  return JSON.stringify(cData, null, 2);

  return {
    legend: [0.2, 0.6, 0.9],
    maintenance: mData, 
    direction: dData,
    community: cData,
  };
}
