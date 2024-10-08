import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Bucket, Storage } from "@google-cloud/storage";

const storage = new Storage();

const org_video_bucket_name = "vids-shrink-org";
const comp_vide_bucket_name = "vids-shrink-comp";

const org_video_dir = "./org_vids";
const comp_video_dir = "./comp_vids";

export function reduce_video(org_file_name: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(org_file_name)
      .outputOptions("-vf", "scale=-1:480")
      .on("end", () => {
        console.log("Process Complete");
        resolve();
      })
      .on("error", (err) => {
        console.log(`An error occured ${err.message}`);
        reject(err);
      })
      .save(`${comp_video_dir}/compressed_${org_file_name}`);
  });
}

export async function download_org_frm_bucket(filename: string) {
  await storage
    .bucket(org_video_bucket_name)
    .file(filename)
    .download({ destination: `${org_video_dir}/${filename}` });

  console.log("Video downloaded from bucket to Image");
}

export async function upload_comp_to_bucket(filename: string) {
  await storage
    .bucket(comp_vide_bucket_name)
    .upload(`${comp_video_dir}/${filename}`, {
      destination: filename,
    });
}
