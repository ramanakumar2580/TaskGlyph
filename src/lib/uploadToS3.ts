/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * [UPDATED] The object returned by the uploader.
 * It now includes the full public URL.
 */
export interface S3UploadResponse {
  s3Key: string;
  url: string; // The full public URL
  fileName: string;
  fileSize: number;
}

/**
 * Uploads a file to AWS S3 using your Next.js presigned URL route.
 *
 * @param file - The File object (from input or drag-drop)
 * @param entityType - "notes" | "diary"
 * @returns An object with the s3Key, public URL, fileName, and fileSize
 */
export async function uploadToS3(
  file: File,
  entityType: "notes" | "diary"
): Promise<S3UploadResponse> {
  try {
    // 1️⃣ Request a presigned URL
    const res = await fetch("/api/s3-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        entityType,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to get upload URL");
    }

    const { uploadUrl, s3Key } = await res.json();

    // 2️⃣ Upload the file directly to S3
    const upload = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!upload.ok) {
      throw new Error("Failed to upload file to S3");
    }

    // 3️⃣ [NEW] Construct the final public URL
    // Make sure these NEXT_PUBLIC_ variables are in your .env.local
    const finalUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com/${s3Key}`;

    return {
      s3Key: s3Key,
      url: finalUrl, // Return the full URL
      fileName: file.name,
      fileSize: file.size,
    };
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    throw new Error(error.message || "Upload failed");
  }
}
