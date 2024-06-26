const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const AWS = require('aws-sdk');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');
var path = require('path');
const cors = require('cors');

const app = express();
app.use(bodyParser.json({ type: ['application/json'] }));
app.use(cors());
const port = process.env.PORT || 3001;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const s3Params = {
    Bucket: process.env.INCOMING_BUCKET,
    Key: file.originalname,
    Body: fs.createReadStream(file.path),
  };

  s3.upload(s3Params, async (err, data) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.status(200).json({ message: 'File uploaded successfully', data });
  });
});

app.post('/save-metadata', async (req, res) => {
  const metadatas = req.body;
  console.log(req.body.files);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO file_metadata (file_name, file_size, file_created_date, file_type)
      VALUES ($1, $2, $3, $4)
    `;

    for (const metadata of metadatas) {
      await client.query(insertQuery, [
        metadata.file_name,
        metadata.file_size,
        metadata.file_created_date,
        metadata.file_type,
      ]);
    }

    await client.query('COMMIT');

    res.status(200).json({ message: 'Metadata saved successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving metadata:', error);

    res.status(500).json({ error: 'Error saving metadata' });
  } finally {
    client.release();
  }
});

app.get('/search', async (req, res) => {
  const { searchTerm } = req.query;
  if (!searchTerm) {
    res.status(400).json({ error: 'Provide a search text' });
  }

  let query = `SELECT * FROM file_metadata WHERE file_name ILIKE '%${searchTerm}%' OR file_type ILIKE '%${searchTerm}%'`;

  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
