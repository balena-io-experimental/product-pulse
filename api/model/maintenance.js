const moment = require('moment');

const utils = require('../utils');

function criterion1(commits, w) {
  return commits.filter(commit => moment(commit.commit.author.date).isAfter(moment().subtract(w, 'weeks'))).length;
}

function criterion2(issues) {
  const openCount = issues.filter(i => i.state === 'open').length;
  const closedCount = issues.filter(i => i.state === 'closed').length;
  return utils.roundFloat(openCount / (closedCount + openCount));
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

exports.get = async ({ 
  commits, 
  issues, 
  maintainerCommentedIssues, 
  archMdExists,
  months,
  mVariables: m
}) => {
  // Has had X commits in W weeks
  const c1 = (x, w) => {
    const numCommits = criterion1(commits, w);
    const pass = numCommits >= x;
    return {
      criterion: 'activity',
      description: `Has had ${x} commit(s) in last ${w} weeks`,
      value: numCommits,
      score: Number(pass),
      weight: m.weights.c1,
      pass
    };
  };

  const c2 = (x) => {
    const percentOpen = criterion2(issues);
    const pass = percentOpen <= x;
    return {
      criterion: 'issues',
      description: `Percentage of issues that are open is less than ${x*100}% in last ${months} months`,
      value: percentOpen,
      score: percentOpen,
      weight: m.weights.c2,
      pass
    };
  };

  const c3 = (x) => {
    const percentLabelled = criterion3(issues);
    const pass = percentLabelled >= x;
    return {
      criterion: 'organization',
      description: `${Math.round(x*100)}% of issues have labels in last ${months} months`,
      value: percentLabelled,
      score: percentLabelled,
      weight: m.weights.c3,
      pass
    };
  };

  const c4 = (x) => {
    const score = criterion4(maintainerCommentedIssues, issues);
    const pass = score >= x;
    return {
      criterion: 'communication',
      description: `${x*100}% of issues have responses from maintainers in last ${months} months`,
      value: score,
      score: Number(pass),
      weight: m.weights.c4,
      pass
    };
  };

  const c5 = () => {
    const exists = criterion5(archMdExists);
    const pass = exists === 1;
    return {
      criterion: 'architecture',
      description: `Contains an ARCHITECTURE.md`,
      value: exists,
      score: exists,
      weight: m.weights.c5,
      pass
    };
  };

  const details = [
    c1(...m.x.NUM_COMMITS_IN_WEEKS),
    c2(m.x.PERCENT_OPEN_ISSUES),
    c3(m.x.PERCENT_ISSUES_WITH_LABEL),
    c4(m.x.PERCENT_ISSUES_WITH_RESPONSE),
    c5()
  ];

  return {
    score: utils.roundFloat(details.map(c => c.score * c.weight).reduce((total, v) => total + v, 0)),
    details
  };
}
