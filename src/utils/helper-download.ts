export const getDownloadUrl = (url: string) => {
  return url.replace('/upload/', '/upload/fl_attachment/');
};