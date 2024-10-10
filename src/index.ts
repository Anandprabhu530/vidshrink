import express from "express";
import { delete_file, dir_exists, reduce_video } from "./Storage";
import path from "path";

const app = express();
app.use(express.json());

dir_exists();

app.get("/compress", async (req, res) => {
  const unprocessed_file_path = req.body.unprocessed_file_path;
  const output_file_path = req.body.output_file_path;

  // await download_org_frm_bucket(unprocessed_file_path);
  const PROJECT_ROOT = path.resolve(__dirname, "../comp_vids");
  try {
    //reduce video and add it to the local directory
    await reduce_video(unprocessed_file_path, output_file_path);

    //add download video functionality
    res.sendFile(`compressed_${output_file_path}`, {
      root: PROJECT_ROOT,
    });
  } catch (error) {
    console.log(`An error Occured ${error}`);
  } finally {
    await delete_file(`./comp_vids/compressed_${output_file_path}`);
  }
});

const PORT = process.env.port || 3001;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
