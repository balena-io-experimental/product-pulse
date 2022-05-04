const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const BUILD_DIR = path.resolve(__dirname, '../build');
const HTML = path.join(BUILD_DIR, 'index.html');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(BUILD_DIR));

app.get('/api', async (req, res) => {
    res.send('lol');
});

app.get('/', (req, res) => {
    res.sendFile(HTML);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
