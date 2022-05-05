/**
 * Given Date object, return a YYYY-MM-DD timestamp.
 * @param {Date} date
 * @returns string
 */
const toGitHubQueryDate = (date) => date.toISOString().replace(/T.+Z/, '');

/**
 * Return YYYY-MM-DD timestamp n months ago from current timestamp.
 * @param {number} n
 * @returns string
 */
const getNMonthsAgo = (n) => {
  const date = new Date();
  const curMonth = date.getMonth();

  date.setMonth(curMonth - n);
  // If still in same month, set date to last day of previous month
  if (date.getMonth() === curMonth) {
      date.setDate(0);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

const sortByAuthor = (commits) => {
  const authors = new Map();
  commits.forEach(commit => {
    const author = commit.commit.author.name;
    if (authors.has(author)) {
      const previous = authors.get(author);
      authors.set(author, { commits: previous.commits.concat(commit)})
    } else {
      authors.set(author, { commits: [commit]})
    }
  });
  return authors 
}

const getCoreContributors = (commits) => {
  const commitCount = commits.length;

  const commitsPerContributor = sortByAuthor(commits);

  const numContributors = Object.keys(commitsPerContributor).length;

  const thresholdCommitCount = Math.floor(commitCount / commitsPerContributor.size);

  const coreContributors = commitsPerContributor
      .filter(([, numCommits ]) => numCommits >= thresholdCommitCount)
      .map(([ login ]) => login);

  return coreContributors;
}

const FLOAT_DECIMAL_PLACES = 3;
const roundFloat = (float) => parseFloat(float.toFixed(FLOAT_DECIMAL_PLACES));
const percentage = (num1, num2) => roundFloat(num1 / num2);
const average = (num1, num2) => (num1 + num2) / 2;

module.exports = {
  toGitHubQueryDate,
  getNMonthsAgo,
  sortByAuthor,
  getCoreContributors,
  roundFloat,
  percentage,
  average
}
