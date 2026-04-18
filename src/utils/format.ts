export function formatIDR(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '';

  const number = typeof value === 'number' ? value : Number(String(value).replace(/[^\d]/g, ''));

  if (Number.isNaN(number)) return '';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
}

export function parseIDR(value: string) {
  return Number(value.replace(/[^\d]/g, '')) || 0;
}

export function formatTenure(fromDate: string | Date) {
  const start = new Date(fromDate);
  const now = new Date();

  const diffMs = now.getTime() - start.getTime();
  if (diffMs <= 0) return '0 hari';

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  if (months <= 0) {
    return `${days} hari`;
  }

  if (days === 0) {
    return `${months} bulan`;
  }

  return `${months} bulan ${days} hari`;
}
