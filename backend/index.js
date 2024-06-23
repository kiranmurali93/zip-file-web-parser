const express = require('express');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

