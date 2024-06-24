const AWS = require("aws-sdk");
const unzipper = require("unzipper");
const axios = require('axios');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_BUCKET,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_BUCKET,
    region: process.env.AWS_REGION_BUCKET,
  });

exports.handler = async (event) => {
  const bucket = process.env.INCOMING_BUCKET;
  const finalBucket = process.env.FINAL_BUCKET;

  const records = event.Records;
  for (const record of records) {
    const key = record.s3.object.key;

    const params = {
      Bucket: bucket,
      Key: key,
    };

    try {
      const data = await s3.getObject(params).promise();

      const directory = await unzipper.Open.buffer(data.Body);
      const filesMetadata = []

      for (const file of directory.files) {
        
        if (!file.path.endsWith("/")) {
          const content = await file.buffer();
          const uploadParams = {
            Bucket: finalBucket,
            Key: file.path,
            Body: content,
          };
          await s3.upload(uploadParams).promise();

          const metadata = {
            file_name: file.path,
            file_size: content.length,
            file_created_date: new Date().toISOString(),
            file_type: file.type,
          };

          filesMetadata.push(metadata)
        }
      }

      await axios.post(`${process.env.BACKEND_API_URL}/save-metadata`, { files: filesMetadata });

      await s3.deleteObject(params).promise();
    } catch (err) {
      console.error(`Error processing from bucket ${bucket}: ${err}`);
      throw err;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Files processed successfully"),
  };
};
