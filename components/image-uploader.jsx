"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";

export default function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const sigRes = await fetch("/api/cloudinary/signature", {
        method: "POST",
      });
      if (!sigRes.ok) throw new Error("Could not get upload signature");
      const { timestamp, signature, folder, apiKey, cloudName } =
        await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await uploadRes.json();

      if (!uploadRes.ok)
        throw new Error(data.error?.message ?? "Upload failed");

      onChange(data.secure_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative w-32 h-32">
          <img
            src={value}
            alt="Product"
            className="w-32 h-32 object-cover rounded-lg border border-slate-200"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-900 text-slate-400 hover:text-blue-900 transition-colors">
          <ImagePlus size={22} />
          <span className="text-xs mt-1">
            {uploading ? "Uploading..." : "Add photo"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
