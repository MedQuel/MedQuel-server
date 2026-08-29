import { ref, getStorage, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';

import { auth, firebaseApp } from './firebase';
import { ProfilePhotoUploadError } from '../api/api.errors';


const storage = getStorage(firebaseApp);

const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

function extractStoragePath(downloadUrl: string): string | null {
  try {
    const url = new URL(downloadUrl);
    const match = url.pathname.match(/\/o\/(.+)$/);
    if (!match) return null;

    const storagePath = match[1];
    if (!storagePath) return null;

    return decodeURIComponent(storagePath);
  } catch {
    return null;
  }
}


export async function uploadProfilePhoto(localUri: string, previousPhotoURL?: string | null): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new ProfilePhotoUploadError('You must be signed in to upload a profile photo.');
  if (!localUri) throw new ProfilePhotoUploadError('No image was selected.');

  let blob: Blob;
  try {
    const response = await fetch(localUri);
    blob = await response.blob();
  } catch {
    throw new ProfilePhotoUploadError('Could not read the selected image. Please try a different photo.');
  }

  if (blob.size === 0) throw new ProfilePhotoUploadError('The selected image appears to be empty.');
  if (blob.size > MAX_PROFILE_PHOTO_BYTES) throw new ProfilePhotoUploadError('Image is too large — please choose one under 5MB.');

  const mimeType = blob.type || 'image/jpeg';
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new ProfilePhotoUploadError('Unsupported image format — please use JPG, PNG, or WEBP.');
  }

  const extension = extensionForMimeType(mimeType);
  const path = `profilePhotos/${user.uid}/${Date.now()}.${extension}`;
  const storageRef = ref(storage, path);

  try {
    await uploadBytes(storageRef, blob, { contentType: mimeType });
  } catch {
    throw new ProfilePhotoUploadError('Upload failed — please check your connection and try again.');
  }

  let downloadUrl: string;
  try {
    downloadUrl = await getDownloadURL(storageRef);
  } catch {
    throw new ProfilePhotoUploadError('Photo uploaded, but we could not generate its link. Please try again.');
  }

  if (previousPhotoURL) {
    const previousPath = extractStoragePath(previousPhotoURL);
    if (previousPath && previousPath !== path) {
      deleteObject(ref(storage, previousPath)).catch(() => {
        // Orphaned old file
      });
    }
  }

  return downloadUrl;
}
