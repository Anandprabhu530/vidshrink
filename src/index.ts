import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.get("/compress", (req, res): any => {
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
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
