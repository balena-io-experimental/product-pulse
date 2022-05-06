const moment = require('moment');

const utils = require('../utils');

function criterion1(commits, w) {
  return commits.filter(commit => moment(commit.commit.author.date).isAfter(moment().subtract(w, 'weeks'))).length;
}

function criterion2(issues) {
  const open = issues.filter(i => i.state === 'open')
  const closed = issues.filter(i => i.state === 'closed')
  return utils.roundFloat(open + closed / open);
}

function criterion3(issues) {
  const hasLabels = issues.filter(issue => issue.labels.length > 0);
  return utils.roundFloat(hasLabels.length / issues.length);
}

function criterion4(maintainerCommented, issues) {
  return utils.roundFloat(maintainerCommented.length / issues.length); 
}

function criterion5(architecureDocExists) {
  return architecureDocExists ? 1 : 0;
}

exports.get = async ({ commits, issues, maintainerCommentedIssues, archMdExists, mX }) => {
  // Has had X commits in W weeks
  const c1 = (x, w) => {
    const score = criterion1(commits, w);
    return {
      criterion: 'activity',
      description: `Has had ${x} commits in the last ${w} weeks`,
      score,
      weight: 0.2,
      pass: score > x
    };
  };

  const c2 = (x) => {
    const score = criterion2(issues);
    return {
      criterion: 'issues',
      description: `Open to close issue ration is less than ${x}`,
      score,
      weight: 0.2,
      pass: score < x
    };
  };

  const c3 = (x) => {
    const score = criterion3(issues);
    return {
      criterion: 'organization',
      description: `${Math.round(x*100)}% of issues have labels`,
      score,
      weight: 0.2,
      pass: score > x
    };
  };

  const c4 = (x) => {
    const score = criterion4(maintainerCommentedIssues, issues);
    return {
      criterion: 'communication',
      description: `${x*100} of issues have responses from maintainers`,
      score,
      weight: 0.2,
      pass: score > x
    };
  };

  const c5 = () => {
    const score = criterion5(archMdExists);
    return {
      criterion: 'architecture',
      description: `Contains an ARCHITECTURE.md`,
      score,
      weight: 0.2,
      pass: score === 1
    };
  };

  const details = [
    c1(...mX.COMMITS_IN_WEEKS),
    c2(mX.OPEN_TO_CLOSED_ISSUES),
    c3(mX.ISSUES_WITH_LABELS),
    c4(mX.ISSUES_WITH_RESPONSE),
    c5()
  ];

  return {
    score: details.map(c => c.score * c.weight).reduce((total, v) => total + v, 0),
    details
  };
}
