const github = require('./github');

exports.get = async (owner, repo) => {
  const contributingSize = await github.getContributingFileSize(owner, repo);

  return {
    crit1: contributingSize > 0, // QUESTION: should we check for a minimum size
    crit2: 0,
    crit3: 0,
    crit4: 0,
  };
}

