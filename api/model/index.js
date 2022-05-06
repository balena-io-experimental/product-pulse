const github = require('../github');
const utils = require('../utils');
const maintenance = require('./maintenance');
// const direction = require('./direction');
const community = require ('./community');

exports.calculate = async (owner, repo) => {
  // Assign consts and thresholds
  const MONTHS = 3;
  const maintenanceX = {
    COMMITS_IN_WEEKS: [1, 4],
    OPEN_TO_CLOSED_ISSUES: 0.5,
    ISSUES_WITH_LABEL: 0.2,
    ISSUES_WITH_RESPONSE: 0.7
  };
  // const directionX = {

  // };
  const communityX = {
    MIN_STARS: 5,
    MIN_FORKS: 2,
    EXTERNAL_COMMITS_PRS: 0.05,
    EXTERNAL_ISSUES: 0.3
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

  // Apply individual algorithms
  const mData = await maintenance.get({ 
    commits, 
    issues, 
    maintainerCommentedIssues, 
    archMdExists, 
    mX: maintenanceX
  });
  // const dData = await direction.get(owner, repo);
  const cData = await community.get({
    repo: repoData,
    commits,
    PRs,
    issues,
    maintainers,
    cX: communityX
  });

  return {
    legend: [0.2, 0.6, 0.9],
    maintenance: mData, // average the mData 
    direction: 'TODO', // average the dData
    community: cData, // average the cData
  };
}
