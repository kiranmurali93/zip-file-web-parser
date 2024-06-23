const express = require('express');
require('dotenv').config();
const AWS = require('aws-sdk');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const s3Params = {
    Bucket: process.env.INCOMING_BUCKET,
    Key: file.filename,
    Body: fs.createReadStream(file.path),
  };

  s3.upload(s3Params, async (err, data) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    //TODO: trigger the lambda function

    res.status(200).json({ message: 'File uploaded successfully', data });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
