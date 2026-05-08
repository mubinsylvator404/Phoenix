
export const getDirectDriveLink = (url: string) => {
  if (!url) return url;
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/\/d\/([^/]+)/)?.[1] || url.match(/id=([^&]+)/)?.[1];
    if (fileId) {
      // Use the direct link format that works for images
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  return url;
};
