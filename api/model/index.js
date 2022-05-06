const github = require('../github');
const utils = require('../utils');
const maintenance = require('./maintenance');
const direction = require('./direction');
const community = require ('./community');

exports.calculate = async (owner, repo) => {
  // Assign consts and thresholds
  const MONTHS = 3;
  const mVariables = {
    x: {
      NUM_COMMITS_IN_WEEKS: [1, 4],
      PERCENT_OPEN_TO_CLOSED_ISSUES: 0.5,
      PERCENT_ISSUES_WITH_LABEL: 0.2,
      PERCENT_ISSUES_WITH_RESPONSE: 0.7
    },
    weights: {
      c1: 0.2,
      c2: 0.2,
      c3: 0.2,
      c4: 0.2,
      c5: 0.2
    }
  };
  const dVariables = {
    x: {
      PERCENT_PRS_REVIEWED_COMMENTED: 0.7,
      PERCENT_INTERNAL_COMMITS: 0.85,
      NUM_ISSUES_ASSIGNED: 0
    },
    weights: {
      c1: 0.25,
      c2: 0.25,
      c3: 0.25,
      c4: 0.25
    }
  };
  const cVariables = {
    x: {
      MIN_STARS: 5,
      MIN_FORKS: 2,
      PERCENT_EXTERNAL_COMMITS_PRS: 0.05,
      PERCENT_EXTERNAL_ISSUES: 0.3
    },
    weights: {
      c1: 0.25,
      c2: 0.25,
      c3: 0.25,
      c4: 0.25
    }
  };

  // Collect data once for all the algorithms
  const repoData = await github.getRepo(owner, repo);
  const commits = await github.getCommits(owner, repo, MONTHS);
  const issues = await github.getIssues(owner, repo, MONTHS);
  const PRs = await github.getPRs(owner, repo, MONTHS);
  const maintainers = utils.getCoreContributors(commits);
  
  // Data needed for maintenance
  const maintainersQuery = maintainers.reduce((f, m) => {
    f.push(`commenter:${m}`)
    return f;
  }, []).join(' ');
  const maintainerCommentedIssues = await github.getIssues(owner, repo, MONTHS, maintainersQuery);
  const archMdExists = (await github.getFileSize(owner, repo, 'ARCHITECTURE.md')) > 0;

  // Data needed for direction
  const contributingMdExists = (await github.getFileSize(owner, repo, 'CONTRIBUTING.md')) > 0;

  // Apply individual algorithms
  const mData = await maintenance.get({ 
    commits, 
    issues, 
    maintainerCommentedIssues, 
    archMdExists, 
    mVariables
  });
  const dData = await direction.get({
    issues,
    contributingMdExists,
    dVariables
  });
  const cData = await community.get({
    repo: repoData,
    commits,
    PRs,
    issues,
    maintainers,
    cVariables
  });

  return {
    legend: [0.2, 0.6, 0.9],
    maintenance: mData, 
    direction: dData,
    community: cData,
  };
}
