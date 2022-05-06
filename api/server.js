const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const github = require('./github');
// const model = require('./model');

const BUILD_DIR = path.resolve(__dirname, '../build');
const HTML = path.join(BUILD_DIR, 'index.html');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(BUILD_DIR));

const { sampleResponse } = require('./sample-api-response');

app.get('/pulse/:org/:repo', async (req, res) => {
  const { org, repo } = req.params;
  try {
    if (!(await github.isAccessibleRepo(org, repo))) {
      return res.status(400).send('Not a valid repo or is not accessible');
    }
    // const data = await model.calculate(org, repo);
    return res.status(200).send(sampleResponse);
  } catch (e) {
    return res.status(500).send(`Error - ${e}`);
  }
});

app.get('/', (_req, res) => {
    res.sendFile(HTML);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
