import express from "express";
import {
  delete_file,
  dir_exists,
  download_org_frm_bucket,
  generate_signed_url,
  reduce_video,
  upload_processed_video,
} from "./Storage";

const app = express();
app.use(express.json());

dir_exists();

app.get("/compress", async (req, res) => {
  if (!req.body) {
    const msg = "no Pub/Sub message received";
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  if (!req.body.message) {
    const msg = "invalid Pub/Sub message format";
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  //get file name from pub/sub
  let data;
  const pubSubMessage = req.body.message;
  const pub_sub_msg = Buffer.from(pubSubMessage.data, "base64")
    .toString()
    .trim();
  data = JSON.parse(pub_sub_msg);
  const filename = data.name;

  //processed_FileName
  const processedFilename = `compressed_${filename}`;

  try {
    //code to download from Bucket
    await download_org_frm_bucket(filename);

    //reduce video and add it to the local directory
    await reduce_video(filename);

    //add download video functionality
    await upload_processed_video(processedFilename);

    //delete files
    Promise.all([
      await delete_file(`.org_vids/${filename}`),
      await delete_file(`.comp_vids/${processedFilename}`),
    ]);

    // Generate signed URL
    const signedUrl = await generate_signed_url(processedFilename);

    //respond with signedURL
    res.json({ signedURL: signedUrl });
  } catch (error) {
    console.log(`An error Occured ${error}`);
    Promise.all([
      await delete_file(`.org_vids/${filename}`),
      await delete_file(`.comp_vids/${processedFilename}`),
    ]);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.port || 3001;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
