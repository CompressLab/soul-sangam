/**
 * Cloudinary unsigned upload helper.
 * Works in both browser (File/Blob) and React Native (local URI via fetch→blob).
 *
 * Cloud name and upload preset are public values — safe to use in frontend code.
 */

export const CLOUDINARY_CLOUD_NAME   = "d7epboym";
export const CLOUDINARY_UPLOAD_PRESET = "matrimonial_profiles";

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id:  string;
  width:      number;
  height:     number;
  format:     string;
  bytes:      number;
}

/**
 * Upload a File or Blob to Cloudinary using an unsigned upload preset.
 * Returns the secure HTTPS URL of the uploaded image.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  folder = "profiles"
): Promise<CloudinaryUploadResult> {
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 5 MB.");
  }

  const formData = new FormData();
  formData.append("file",           file);
  formData.append("upload_preset",  CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder",         folder);

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body:   formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Cloudinary upload failed.");
  }

  return response.json() as Promise<CloudinaryUploadResult>;
}

/**
 * React Native helper: converts a local file URI to a Blob then uploads.
 */
export async function uploadUriToCloudinary(
  uri: string,
  folder = "profiles"
): Promise<CloudinaryUploadResult> {
  const response = await fetch(uri);
  const blob     = await response.blob();
  return uploadToCloudinary(blob, folder);
}

/**
 * Build an optimised Cloudinary URL with auto format/quality and optional resize.
 */
export function cloudinaryUrl(
  publicIdOrUrl: string,
  opts: { width?: number; height?: number; crop?: string } = {}
): string {
  // If it's already a full URL, return as-is
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const transforms = [
    "f_auto",
    "q_auto",
    opts.width  ? `w_${opts.width}`  : "",
    opts.height ? `h_${opts.height}` : "",
    opts.crop   ? `c_${opts.crop}`   : "c_fill",
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicIdOrUrl}`;
}
