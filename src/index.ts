import express from "express";
import {
  delete_file,
  dir_exists,
  download_org_frm_bucket,
  reduce_video,
} from "./Storage";

import fs from "fs";
const app = express();
app.use(express.json());

dir_exists();

app.get("/compress", async (req, res) => {
  const unprocessed_file_path = req.body.inpufile;
  const output_file_path = req.body.output;

  // ffmpeg.getAvailableFormats(function (err, formats) {
  //   console.log("Available formats:");
  //   console.dir(formats);
  // });

  // ffmpeg.getAvailableCodecs(function (err, codecs) {
  //   console.log("Available codecs:");
  //   console.dir(codecs);
  // });

  // ffmpeg.getAvailableEncoders(function (err, encoders) {
  //   console.log("Available encoders:");
  //   console.dir(encoders);
  // });

  // ffmpeg.getAvailableFilters(function (err, filters) {
  //   console.log("Available filters:");
  //   console.dir(filters);
  // });
  await download_org_frm_bucket(unprocessed_file_path);
  try {
    //reduce video and add it to the local directory
    await reduce_video(unprocessed_file_path);

    //add download video functionality
    if (fs.existsSync(output_file_path)) {
    }
  } catch (error) {
    Promise.all([
      await delete_file(unprocessed_file_path),
      await delete_file(output_file_path),
    ]);

    console.log(`An error Occured ${error}`);
  }
});

const PORT = process.env.port || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
