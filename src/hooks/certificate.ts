import { endpoints } from '@/utils/helper-server';

// base URL API
const URL_CERTIFICATE_DOWNLOAD = endpoints.certificate.base;
const URL_CERTIFICATE_DOWNLOAD_PARTICIPANT = endpoints.certificate.participant;

// ===========================
// GET ONE BY ID
// ===========================
export const downloadCertificate = async (id: string) => {
  if (!id) return;

  try {
    const res = await fetch(`${URL_CERTIFICATE_DOWNLOAD}/${id}`);

    if (!res.ok) {
      throw new Error('Gagal download certificate');
    }

    const blob = await res.blob();

    // =========================
    // AUTO DOWNLOAD
    // =========================
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${id}.jpg`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const downloadCertificateParticipant = async (
  batchId: string,
  participantId: string
) => {
  if (!batchId || !participantId) return;

  try {
    const res = await fetch(
      `${URL_CERTIFICATE_DOWNLOAD_PARTICIPANT}/${batchId}?participant_id=${participantId}`
    );

    if (!res.ok) {
      throw new Error('Gagal download certificate');
    }

    const blob = await res.blob();

    // =========================
    // AUTO DOWNLOAD
    // =========================
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${batchId}.jpg`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('DOWNLOAD ERROR:', err);
    throw err;
  }
};

export const downloadCertificateBulk = async (
  batchId: string,
  participantIds: string[]
) => {
  if (!batchId || !participantIds?.length) return;

  try {
    const query = participantIds.map((id) => `participant_id=${id}`).join('&');

    const res = await fetch(
      `${URL_CERTIFICATE_DOWNLOAD_PARTICIPANT}/${batchId}?${query}`
    );

    if (!res.ok) {
      throw new Error('Gagal download certificate');
    }

    const blob = await res.blob();

    const contentType = res.headers.get('content-type');

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // 🔥 FIX DI SINI
    if (contentType === 'image/jpeg') {
      link.download = `certificate-${participantIds[0]}.jpg`;
    } else {
      link.download = `certificates-${batchId}.zip`;
    }

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('DOWNLOAD ERROR:', err);
    throw err;
  }
};
