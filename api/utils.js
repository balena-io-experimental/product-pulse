// Exclude bots from contributor calculations
const GH_BOTS = process.env.GH_BOTS || ['balena-ci', 'renovate-bot', 'Balena CI', 'bulldozer-balena[bot]'];

/**
 * Given Date object, return a YYYY-MM-DD timestamp.
 * @param {Date} date
 * @returns string
 */
exports.toGitHubQueryDate = (date) => date.toISOString().replace(/T.+Z/, '');

/**
 * Return YYYY-MM-DD timestamp n months ago from current timestamp.
 * @param {number} n
 * @returns string
 */
exports.getNMonthsAgo = (n) => {
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
  return commits.reduce((authors, c) => {
    const author = c.commit.author.name;
    if (authors[author]) {
      authors[author].commits.push(c);
    } else {
      authors[author] = { commits: [c] };
    }
    return authors;
  }, {});
}

const removeBots = (commits) =>
  commits.filter((c) => !GH_BOTS.includes(c.commit.author.name));

exports.getCoreContributors = (commits) => {
  // Remove commits made by bots
  const commitsWithoutBots = removeBots(commits);

  // Total contributor commit count
  const commitCount = commitsWithoutBots.length;

  // An object of authors -> a list of their commits
  const commitsByAuthor = sortByAuthor(commitsWithoutBots);

  // Total number of contributors
  const numContributors = Object.keys(commitsByAuthor).length;

  // Commit count when distributed evenly amongst contributors
  // i.e. 100 commits distributed amongst 10 contributors == 10 commits (10 per contributor)
  const distrbutedCommitCountPerContributor = Math.floor(commitCount / numContributors);

  // Core contributors contributed more than distributed commit count
  const coreContributors = Object.entries(commitsByAuthor)
      .filter(([, commits ]) => commits.length >= distrbutedCommitCountPerContributor)
      .map(([ contributor ]) => contributor);

  return coreContributors;
}

const FLOAT_DECIMAL_PLACES = 3;
const roundFloat = (float) => parseFloat(float.toFixed(FLOAT_DECIMAL_PLACES));
exports.roundFloat = roundFloat;
exports.percentage = (num1, num2) => roundFloat(num1 / num2);
exports.average = (num1, num2) => (num1 + num2) / 2;