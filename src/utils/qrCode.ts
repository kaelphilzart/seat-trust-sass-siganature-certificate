import { encodeId } from '@/utils/encode';

export function buildQrTargetUrl(
  batchRepresentativeId?: string
): string | null {
  if (!batchRepresentativeId) return null;

  const base = 'http://localhost:3000'
  if (!base) return null;

  const token = encodeId(batchRepresentativeId);

  return `${base}/verify-representative/${token}`;
}

export function buildQrImageUrl(
  targetUrl?: string,
  size: number = 300
): string | null {
  if (!targetUrl) return null;

  const encoded = encodeURIComponent(targetUrl);

  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=255-255-255-0;`;
}