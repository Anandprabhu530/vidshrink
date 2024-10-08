import express from "express";
import {
  delete_file,
  dir_exists,
  download_org_frm_bucket,
  reduce_video,
  upload_comp_to_bucket,
} from "./Storage";

const app = express();
app.use(express.json());

dir_exists();

app.get("/compress", async (req, res): any => {
  const unprocessed_file_path = req.body.unprocessed_file_path;
  const output_file_path = req.body.output_file_path;
  if (!unprocessed_file_path || !output_file_path) {
    return res.status(400).send("Input or output path error");
  }

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
    await reduce_video(unprocessed_file_path);
  } catch (error) {
    await delete_file(unprocessed_file_path);
    await delete_file(output_file_path);
    console.log(`An error Occured ${error}`);

    await upload_comp_to_bucket(output_file_path);
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
