"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadToCloudinary } from "@shared/utils/cloudinary";
import { Camera, X, Loader2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

interface Props {
  uid:       string;         // kept for API compatibility; not used for upload path anymore
  photos:    string[];       // Cloudinary secure_url values
  onChange:  (urls: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onChange, maxPhotos = 6 }: Props) {
  const inputRef               = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState<number | null>(null);
  const [dragItem,  setDragItem]  = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxPhotos} photos allowed.`);
      return;
    }

    const toUpload  = Array.from(files).slice(0, remaining);
    const oversized = toUpload.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error("Each photo must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of toUpload) {
        const result = await uploadToCloudinary(file, "profiles");
        newUrls.push(result.secure_url);
      }
      onChange([...photos, ...newUrls]);
      toast.success(`${newUrls.length} photo${newUrls.length > 1 ? "s" : ""} uploaded`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto(index: number) {
    // We don't delete from Cloudinary on remove (would need API Secret server-side)
    // The URL simply won't be saved to Firestore if the user removes it
    onChange(photos.filter((_, i) => i !== index));
  }

  // Drag-to-reorder handlers
  function onDragStart(index: number) { setDragItem(index); }
  function onDragEnter(index: number) { setDragOver(index); }
  function onDragEnd() {
    if (dragItem === null || dragOver === null || dragItem === dragOver) {
      setDragItem(null); setDragOver(null); return;
    }
    const reordered = [...photos];
    const [moved]   = reordered.splice(dragItem, 1);
    reordered.splice(dragOver, 0, moved);
    onChange(reordered);
    setDragItem(null); setDragOver(null);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <div
            key={url}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragEnter={() => onDragEnter(i)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={clsx(
              "relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-grab active:cursor-grabbing",
              dragOver === i && dragItem !== i && "ring-2 ring-primary-500"
            )}
          >
            <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />

            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white
                         flex items-center justify-center opacity-0 group-hover:opacity-100
                         transition-opacity shadow-md"
              aria-label={`Remove photo ${i + 1}`}
            >
              <X size={12} />
            </button>

            <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-60 transition-opacity">
              <GripVertical size={14} className="text-white drop-shadow" />
            </div>

            {i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 bg-primary-600 text-white
                               text-[10px] font-bold px-1.5 py-0.5 rounded">
                Main
              </span>
            )}
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label
            className={clsx(
              "aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col",
              "items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50",
              "transition gap-1",
              uploading && "opacity-60 pointer-events-none"
            )}
          >
            {uploading ? (
              <Loader2 size={22} className="text-primary-400 animate-spin" />
            ) : (
              <>
                <Camera size={22} className="text-gray-400" />
                <span className="text-xs text-gray-400">Add photo</span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {photos.length}/{maxPhotos} photos · Max 5 MB each · Drag to reorder
      </p>
    </div>
  );
}
