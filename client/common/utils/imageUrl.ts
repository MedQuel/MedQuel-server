 function isEphemeralUri(uri?: string | null): boolean {
  if (!uri) return false;
  return uri.startsWith('blob:') || uri.startsWith('file:');
}

export function hasValidPhoto(photoURL?: string | null): boolean {
  return !!photoURL && !isEphemeralUri(photoURL);
}