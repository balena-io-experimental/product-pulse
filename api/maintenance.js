const moment = require('moment');

const github = require('./github');
const utils = require('./utils');

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
  const maintainers = utils.getCoreContributors(commits);
  const maintainersFilter = maintainers.reduce((f, m) => {
    f.push(`commenter:${m}`)
    return f;
  }, []).join(' ');
  const maintainerCommented = await github.getIssues(owner, repo, MONTHS, maintainersFilter);
  const archMdExists = await github.fileExists(owner, repo, 'ARCHITECTURE.md');

  // Has had X commits in W weeks
  const c1 = (x, w) => {
    const pass = criterion1(commits, x, w);
    return {
      criterion: 'activity',
      description: `Has had ${x} commits in the last ${w} weeks`,
      score: Number(pass),
      weight: 0.2,
      pass
    };
  };

  const c2 = (x) => {
    const pass = criterion2(issues, x);
    return {
      criterion: 'issues',
      description: `Open to close issue ratio is less than ${x}`,
      score: Number(pass),
      weight: 0.2,
      pass
    };
  };

  const c3 = (x) => {
    const pass = criterion3(issues, x);
    return {
      criterion: 'organization',
      description: `${Math.round(x*100)}% of issues have labels`,
      score: Number(pass),
      weight: 0.2,
      pass
    };
  };

  const c4 = async (x) => {
    const pass = await criterion4(maintainerCommented, issues, x);
    return {
      criterion: 'communication',
      description: `${x*100} of issues have responses from top contributors`,
      score: Number(pass),
      weight: 0.2,
      pass
    };
  };

  const c5 = () => {
    const pass = criterion5(archMdExists);
    return {
      criterion: 'architecture',
      description: `Contains an ARCHITECTURE.md`,
      score: Number(pass),
      weight: 0.2,
      pass
    };
  };

  const details = [c1(1, 4), c2(0.5), c3(0.2), await c4(0.7), c5()]

  return {
    score: details.map(c => c.score * c.weight).reduce((total, v) => total + v, 0),
    details
  };
}
