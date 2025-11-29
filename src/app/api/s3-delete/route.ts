import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// 1. Robust Environment Variable Loading
const REGION = "ap-south-2";
const BUCKET =
  process.env.AWS_BUCKET_NAME ||
  process.env.AWS_S3_BUCKET_NAME ||
  process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Check configuration
if (!REGION || !BUCKET || !ACCESS_KEY || !SECRET_KEY) {
  console.error("❌ Missing AWS Configuration in Delete Route");
}

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY!,
    secretAccessKey: SECRET_KEY!,
  },
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // 2. Extract the Key correctly
    // URL: https://bucket.s3.region.amazonaws.com/user/folder/file.jpg
    const urlObj = new URL(url);
    const key = urlObj.pathname.substring(1); // Remove leading slash

    // Decode URI components (handles spaces/special chars in filenames)
    const decodedKey = decodeURIComponent(key);

    console.log(
      `🗑️ Attempting to delete from bucket: ${BUCKET}, Key: ${decodedKey}`
    );

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: decodedKey,
    });

    await s3Client.send(command);
    console.log("✅ S3 Delete Successful");

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ S3 Delete API Error:", error);
    // Return the actual error message from AWS to help debugging
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
