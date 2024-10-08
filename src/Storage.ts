import fs, { mkdir } from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Storage } from "@google-cloud/storage";

const storage = new Storage();

const org_video_bucket_name = "vids-shrink-org";
const comp_vide_bucket_name = "vids-shrink-comp";

const org_video_dir = "./org_vids";
const comp_video_dir = "./comp_vids";

export function dir_exists() {
  check_dir_availablility(org_video_dir);
  check_dir_availablility(comp_video_dir);
}

function check_dir_availablility(dir_path: string) {
  if (fs.existsSync(dir_path)) {
    fs.mkdirSync(dir_path, { recursive: true });
    console.log(`${dir_path} - created`);
  }
}

export async function reduce_video(org_file_name: string) {
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

export async function delete_file(file_dir: string) {
  return new Promise<void>((resolve, reject) => {
    if (fs.existsSync(file_dir)) {
      fs.unlink(file_dir, (error) => {
        if (error) {
          console.log(`An error occured ${error?.message}`);
          reject(error);
        } else {
          console.log("File deleted - ");
          resolve();
        }
      });
    } else {
      console.log("Skipped... No file found");
      resolve();
    }
  });
}
