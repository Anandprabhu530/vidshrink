import {credential} from "firebase-admin";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

export interface Video {
  id?: string;
  uid?: string;
  status?: "processing" | "processed";
  fileName?: string;
}

export async function setVideo(videoId: string, video: Video) {
  await firestore.collection("videos").doc(videoId).set(video, {merge: true});
}

export async function newVideo(videoId: string) {
  const video = await getVideo(videoId);
  console.log("video", video);
  return video?.status === undefined;
}

export async function getVideo(videoId: string) {
  const response = await firestore.collection("videos").doc(videoId).get();
  return (response.data() as Video) ?? {};
}
