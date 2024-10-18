import express from "express";
import {
  delete_file,
  dir_exists,
  download_org_frm_bucket,
  generate_signed_url,
  reduce_video,
  upload_processed_video,
} from "./Storage";
import {newVideo, setVideo} from "./firebase";

const app = express();
app.use(express.json());

dir_exists();

app.post("/compress", async (req, res) => {
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
  const file_id = filename.split(".")[0];

  if (!newVideo(filename)) {
    res.status(400).json("Video already processing");
  } else {
    await setVideo(filename, {
      id: filename,
      uid: file_id.split("-")[0],
      status: "processing",
    });
  }
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
      await delete_file(`./org_vids/${filename}`),
      await delete_file(`./comp_vids/${processedFilename}`),
    ]);

    await setVideo(filename, {
      status: "processed",
      fileName: processedFilename,
    });

    res.status(200).json("Video processing Completed");
  } catch (error) {
    console.log(`An error Occured ${error}`);
    Promise.all([
      await delete_file(`./org_vids/${filename}`),
      await delete_file(`./comp_vids/${processedFilename}`),
    ]);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
