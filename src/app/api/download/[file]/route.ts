import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safeFile = path.basename(file);
  const filePath = path.join(process.cwd(), "public", safeFile);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Arquivo não encontrado", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const contentType = safeFile.endsWith(".pdf")
    ? "application/pdf"
    : safeFile.endsWith(".zip")
    ? "application/zip"
    : "application/octet-stream";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeFile}"`,
      "Content-Length": String(fileBuffer.length),
    },
  });
}
