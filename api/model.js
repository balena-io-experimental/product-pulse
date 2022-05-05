const github = require('./github');
const maintenance = require('./maintenance');
const direction = require('./direction');
const community = require ('./community');

exports.calculate = async (owner, repo) => {

  // Collect data for all the algorithms
  // const commits = await getCommitsForRepo(owner,repo);
  // add more...
 

  // Apply individual algorithms
  // const mData = await maintenance.get(owner, repo);
  // const dData = await direction.get(owner, repo);
  // const cData = await community.get(owner, repo);

  return {
    maintenance: 0.05, // average the mData 
    direction: 0.15, // average the dData
    community: 0.5, // average the cData
  };
}
