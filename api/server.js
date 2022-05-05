const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const github = require('./github');

const BUILD_DIR = path.resolve(__dirname, '../build');
const HTML = path.join(BUILD_DIR, 'index.html');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(BUILD_DIR));

app.get('/pulse/:org/:repo', async (req, res) => {
  const { org, repo } = req.params;
  try {
    if (!(await github.isAccessibleRepo(org, repo))) {
      return res.status(400).send('Not a valid repo or is not accessible');
    }
    const data = await github.calculateModel(req.params.org, req.params.repo) 
    return res.status(200).send(data);
  } catch (e) {
    return res.status(500).send(`Error - ${e}`);
  }
});

app.get('/', (req, res) => {
    res.sendFile(HTML);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
