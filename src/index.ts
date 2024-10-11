import express from "express";
import { delete_file, dir_exists, reduce_video } from "./Storage";
import path from "path";

const app = express();
app.use(express.json());

dir_exists();

app.get("/compress", async (req, res) => {
  const unprocessed_file_path = req.body.unprocessed_file_path;
  const split_array = unprocessed_file_path.split("/");
  const output_file = split_array[split_array.length - 1];

  //code to download from Bucket
  // await download_org_frm_bucket(unprocessed_file_path);

  //Set path to delete later and also to send it to the end user
  const PROJECT_ROOT = path.resolve(__dirname, "../comp_vids");
  try {
    //reduce video and add it to the local directory
    await reduce_video(unprocessed_file_path, output_file);

    //add download video functionality
    res.sendFile(`compressed_${output_file}`, {
      root: PROJECT_ROOT,
    });
  } catch (error) {
    console.log(`An error Occured ${error}`);
  } finally {
    await delete_file(`./comp_vids/compressed_${unprocessed_file_path}`);
  }
});

const PORT = process.env.port || 3001;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
