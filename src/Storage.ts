import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Storage } from "@google-cloud/storage";

const storage = new Storage();

const org_video_bucket_name = "vids-shrink-org";
const comp_vide_bucket_name = "vids-shrink-comp";

const org_video_dir = "./org_vids";
const comp_video_dir = "./comp_vids";

export function reduce_video(org_file_name: string) {
  ffmpeg(org_file_name)
    .outputOptions("-vf", "scale=-1:380")
    .on("end", () => {
      console.log("Process Complete");
    })
    .on("error", (err) => {
      console.log(`An error occured ${err.message}`);
    })
    .save(`./compressed_${org_file_name}`);
}
