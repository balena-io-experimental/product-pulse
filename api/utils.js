// Exclude bots from contributor calculations
const GH_BOTS = process.env.GH_BOTS || ['balena-ci', 'renovate-bot', 'renovate[bot]', 'Balena CI', 'bulldozer-balena[bot]', 'dependabot[bot]'];

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
  return commits.reduce((authors, commit) => {
    const author = commit.author.login;
    if (authors[author]) {
      authors[author].commits.push(commit);
    } else {
      authors[author] = { commits: [commit] };
    }
    return authors;
  }, {});
}

const isBot = (login) => GH_BOTS.includes(login);
exports.isBot = isBot;

// TODO: This algorithm could use a few more iterations
exports.getCoreContributors = (commits, owner, repo) => {
  // Total contributor commit count
  const commitCount = commits.length;

  // An object of authors -> a list of their commits
  const commitsByAuthor = sortByAuthor(commits);

  // Total number of contributors
  const numContributors = Object.keys(commitsByAuthor).length;

  // Half of commit count when distributed evenly amongst contributors
  // i.e. 100 commits distributed amongst 10 contributors == 5 commits (5 per contributor)
  const distributedCommitCountPerContributor = Math.floor((commitCount / 2) / numContributors);

  // Core contributors contributed more than distributed commit count
  const coreContributors = Object.entries(commitsByAuthor)
      .filter(([, { commits } ]) => commits.length >= distributedCommitCountPerContributor)
      .map(([ contributor ]) => contributor);

  console.log(`Logging this to check algorithm accuracy`, { coreContributors, owner, repo });

  return coreContributors;
}

const FLOAT_DECIMAL_PLACES = 2;
const roundFloat = (float) => parseFloat(Number(float).toFixed(FLOAT_DECIMAL_PLACES));
exports.roundFloat = roundFloat;
exports.percentage = (num1, num2) => roundFloat(num1 / num2);
exports.average = (num1, num2) => (num1 + num2) / 2;