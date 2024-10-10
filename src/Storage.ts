import fs, { createWriteStream } from "fs";
import ffmpeg from "fluent-ffmpeg";
import { pipeline } from "stream/promises";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

const org_video_bucket_name = "vids-shrink-org";

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

export async function reduce_video(
  org_file_name: string,
  output_file_path: string
) {
  console.log(org_file_name);
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
      .save(`${comp_video_dir}/compressed_${output_file_path}`);
  });
}

export async function download_org_frm_bucket(filename: string) {
  try {
    // Create GetObject command
    const getObjectCommand = new GetObjectCommand({
      Bucket: org_video_bucket_name,
      Key: filename,
    });

    // Get the object from S3
    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      throw new Error("No data received from S3");
    }

    // Create a write stream for the output file
    const writeStream = createWriteStream(`${org_video_dir}/${filename}`);

    // Download the video using streams
    await pipeline(response.Body as NodeJS.ReadableStream, writeStream);
    console.log(
      `Video successfully downloaded to ${org_video_dir}/${filename}`
    );
  } catch (error) {
    console.error("Error downloading video:", error);
  }

  //gcp code
  // await storage
  //   .bucket(org_video_bucket_name)
  //   .file(filename)
  //   .download({ destination: `${org_video_dir}/${filename}` });

  console.log("Video downloaded from bucket to Image");
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
