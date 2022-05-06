const { percentage, roundFloat } = require('../utils');

// Criterion 1: Has a CONTRIBUTING.md file
const criterion1 = (contributingDocExists) => contributingDocExists ? 1 : 0;

// Criterion 2: $X% of pull requests are reviewed or commented by $U contributors
// TODO: may need revisit
const criterion2 = (maintainerCommentedReviewedPRs, PRs) => {
  const isClosed = (pr) => pr.state === 'closed';
  const closedMaintainerPRs = maintainerCommentedReviewedPRs.filter(isClosed);
  const closedPRs = PRs.filter(isClosed);

  return percentage(closedMaintainerPRs.length, closedPRs.length);
}

// Criterion 3: $X% of last $Y commits are from $U contributors
const criterion3 = (commits, maintainers) => {
  const commitsByContributors = commits.filter(({ author: { login }}) => maintainers.includes(login));
  return percentage(commitsByContributors.length, commits.length);
}

// Criterion 4: $X of issues that have been assigned in the last $W weeks
const criterion4 = (issues) => {
  return issues.filter(issue => issue.assignee !== null).length;
}

exports.get = async ({ 
  contributingMdExists,
  issues,
  PRs,
  maintainerCommentedReviewedPRs,
  maintainers,
  commits,
  dVariables: d
}) => {
  const c1 = () => {
    const exists = criterion1(contributingMdExists);
    const pass = exists === 1;
    return {
      criterion: 'guidelines',
      description: `Has a CONTRIBUTING.md file`,
      value: exists,
      score: exists,
      weight: d.weights.c1,
      pass
    };
  };

  const c2 = (x) => {
    const percentPRsByCore = criterion2(maintainerCommentedReviewedPRs, PRs);
    const pass = percentPRsByCore >= x;

    return {
      criterion: 'governance',
      description: `>=${Math.round(x*100)}% of closed PRs are reviewed or commented by core contributors`,
      value: percentPRsByCore, 
      score: percentPRsByCore,
      weight: d.weights.c2,
      pass
    }
  }

  const c3 = (x) => {
    const percentCommitsByCore = criterion3(commits, maintainers);
    const pass = percentCommitsByCore >= x;
    return {
      criterion: 'commits',
      description: `>=${Math.round(x*100)}% of commits are from core contributors`,
      value: percentCommitsByCore,
      score: percentCommitsByCore,
      weight: d.weights.c3,
      pass
    }
  }

  const c4 = (x) => {
    const numIssues = criterion4(issues);
    const pass = numIssues > x;
    return {
      criterion: 'issues',
      description: `Has more than ${x} issues assigned recently`,
      value: numIssues,
      score: Number(pass),
      weight: d.weights.c4,
      pass
    };
  };

  const details = [
    c1(), 
    c2(d.x.PERCENT_PRS_REVIEWED_COMMENTED),
    c3(d.x.PERCENT_INTERNAL_COMMITS), 
    c4(d.x.NUM_ISSUES_ASSIGNED)
  ];

  return {
    score: roundFloat(details.map(c => c.score * c.weight).reduce((total, v) => total + v, 0)),
    details
  };
}

