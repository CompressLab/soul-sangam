/**
 * Client-side image compression using canvas.
 * Resizes images to max 1200px wide and compresses to JPEG at 80% quality.
 * Reduces typical phone photos from 3–8 MB down to ~200–400 KB.
 */

const MAX_WIDTH   = 1200;
const MAX_HEIGHT  = 1200;
const QUALITY     = 0.80; // 80% JPEG quality — visually lossless for profile photos
const OUTPUT_TYPE = "image/jpeg";

export async function compressImage(file: File): Promise<File> {
  // Skip if already small enough (< 300 KB)
  if (file.size < 300 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: OUTPUT_TYPE, lastModified: Date.now() }
          );
          resolve(compressed);
        },
        OUTPUT_TYPE,
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}

/** Compress multiple files, returning compressed versions */
export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
