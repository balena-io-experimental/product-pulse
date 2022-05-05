const github = require('./github');

const hasIssueAssignments = async (owner, repo) => {
  try {
    return (await github.getIssues(owner, repo, 3)).filter((issue => issue.assignee !== null)).length > 0;
  }
  catch(e) {
    console.error('Received error in hasIssueAssignments: ', e);
    throw e;
  }
}


exports.get = async (owner, repo) => {
  const contributingSize = await github.getContributingFileSize(owner, repo);
  const hasAssignments = await hasIssueAssignments(owner, repo);

  return {
    crit1: contributingSize > 0, // QUESTION: should we check for a minimum size
    crit2: 0,
    crit3: 0,
    crit4: hasAssignments,
  };
}

