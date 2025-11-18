// src/lib/upload.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/** Upload a file at a local `uri` to Firebase Storage at `path`.
 *  Returns the public download URL.
 */
export async function uploadUriToStorage(path, uri) {
  // Convert the local file (expo camera/image-picker) to a Blob
  const resp = await fetch(uri);
  const blob = await resp.blob();

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  return url;
}