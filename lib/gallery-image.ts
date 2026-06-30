import { IMAGE_JPEG_QUALITY, IMAGE_MAX_WIDTH } from "@/lib/gallery-constants";

export async function compressImageToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = bitmap.width > IMAGE_MAX_WIDTH ? IMAGE_MAX_WIDTH / bitmap.width : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Canvas is not supported in this browser.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", IMAGE_JPEG_QUALITY);
}
