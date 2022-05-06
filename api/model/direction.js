const github = require('../github');

const criterion1 = (contributingDocExists) => contributingDocExists;

const criterion4 = (issues, x) => {
  return issues.filter(issue => issue.assignee !== null).length > x;
}

exports.get = async (owner, repo) => {
  const MONTHS = 3;
  const issues = await github.getIssues(owner, repo, MONTHS);
  const contributingDocExists = await github.getFileSize(owner, repo, 'CONTRIBUTING.md') > 0;

// Has had X commits in W weeks
  const c1 = () => {
    const pass = criterion1(contributingDocExists);
    return {
      criterion: 'guidelines',
      description: `Has a CONTRIBUTING.md file`,
      score: Number(pass),
      weight: 0.25,
      pass
    };
  };

  const c4 = (x, w) => {
    const pass = criterion4(issues, x);
    return {
      criterion: 'issues',
      description: `Has more than ${x} issues assigned in the last ${w} weeks`,
      score: Number(pass),
      weight: 0.25,
      pass
    };
  };

  const details = [c1(), c4(0, MONTHS*4)];

  return {
    score: details.map(c => c.score * c.weight).reduce((total, v) => total + v, 0),
    details
  };
}

