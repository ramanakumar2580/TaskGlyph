/**
 * Deletes a file from AWS S3 via your Next.js API route.
 * * @param url - The full S3 URL of the file to delete
 * @returns boolean - True if deleted successfully
 */
export async function deleteFromS3(url: string): Promise<boolean> {
  try {
    const res = await fetch("/api/s3-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Failed to delete from S3:", err.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteFromS3:", error);
    return false;
  }
}
