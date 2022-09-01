const express = require('express');
const router = require('./routes');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());

app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`ClickSignApiTest Server is running on http://localhost:${PORT}`));
