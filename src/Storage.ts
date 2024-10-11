import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Storage } from "@google-cloud/storage";

const org_video_bucket_name = "vids-shrink-org";

const storage = new Storage();

const org_video_dir = "./org_vids";
const comp_video_dir = "./comp_vids";

export async function dir_exists() {
  check_dir_availablility(org_video_dir);
  check_dir_availablility(comp_video_dir);
}

function check_dir_availablility(dir_path: string) {
  if (!fs.existsSync(dir_path)) {
    fs.mkdirSync(dir_path, { recursive: true });
  }
}

export async function reduce_video(org_file_name: string, output_file: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(org_file_name)
      .outputOptions("-vf", "scale=-1:360")
      .on("end", () => {
        console.log("Process Complete");
        resolve();
      })
      .on("error", (err) => {
        console.log(`An error occured ${err.message}`);
        reject(err);
      })
      .save(`${comp_video_dir}/compressed_${output_file}`);
  });
}

export async function download_org_frm_bucket(filename: string) {
  //gcp code
  try {
    await storage
      .bucket(org_video_bucket_name)
      .file(filename)
      .download({ destination: `${org_video_dir}/${filename}` });
    console.log("Video downloaded from bucket to Image");
  } catch (error) {
    console.log(`Error Occured - ${error}`);
  }
}

export async function delete_file(file_dir: string) {
  return new Promise<void>((resolve, reject) => {
    if (fs.existsSync(file_dir)) {
      fs.unlink(file_dir, (error) => {
        if (error) {
          console.log(`An error occured ${error?.message}`);
          reject(error);
        } else {
          console.log(`File deleted - ${file_dir}`);
          resolve();
        }
      });
    } else {
      console.log(`Skipped... No file found - ${file_dir}`);
      resolve();
    }
  });
}
