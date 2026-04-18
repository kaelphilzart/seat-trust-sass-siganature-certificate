// src/utils/datetime.ts
import { format, differenceInCalendarDays, addDays } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

export function parseApiDateTime(src?: string | null): Date | null {
  if (!src) return null;
  const raw = String(src).trim();
  if (!raw) return null;

  // ISO dengan timezone (Z atau +07:00)
  if (/T/.test(raw) && (/[zZ]$/.test(raw) || /[+\-]\d{2}:\d{2}$/.test(raw))) {
    const d = new Date(raw);
    return isNaN(+d) ? null : d;
  }

  // "YYYY-MM-DD HH:mm:ss" atau "YYYY-MM-DDTHH:mm:ss(.SSS)"
  const s = raw.replace(' ', 'T');
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (m) {
    const [, yy, MM, dd, HH, mm, ss, ms] = m;
    const d = new Date(
      Number(yy),
      Number(MM) - 1,
      Number(dd),
      Number(HH),
      Number(mm),
      Number(ss),
      ms ? Number(ms.padEnd(3, '0')) : 0
    );
    return isNaN(+d) ? null : d;
  }

  const d = new Date(raw);
  return isNaN(+d) ? null : d;
}

/** Format ke HH:mm:ss lokal, fallback '—' kalau invalid/null */
export function fmtLocalTimeHHmmss(src?: string | null) {
  const d = parseApiDateTime(src);
  return d ? format(d, 'HH:mm:ss', { locale: localeID }) : '—';
}

/** Format ke dd/MM/yyyy lokal, fallback '—' kalau invalid/null */
export function fmtLocalDateDDMMYYYY(src?: string | null) {
  const d = parseApiDateTime(src);
  return d ? format(d, 'dd/MM/yyyy', { locale: localeID }) : '—';
}

export function extractTimeHHmm(src?: string | null | Date): string {
  if (!src) return '';

  // String langsung
  if (typeof src === 'string') {
    const s = src.trim();

    // Sudah HH:mm
    if (/^\d{2}:\d{2}$/.test(s)) return s;

    // Ada pattern HH:mm di tengah HH:mm:ss / ISO, ambil
    const m = s.match(/(\d{2}:\d{2})/);
    if (m) return m[1];
  }

  // Coba parse sebagai Date/ISO
  const d = src instanceof Date ? src : parseApiDateTime(String(src));
  if (!d) return '';

  return format(d, 'HH:mm');
}

/** Format: 12 Januari 2026 (ID), timezone Asia/Jakarta */
export function fmtLocalDateLongID(src?: string | null): string {
  const d = parseApiDateTime(src);
  return d ? format(d, 'd MMMM yyyy', { locale: localeID }) : '—';
}

/** Format: 12 Januari 2026 s/d 15 Januari 2026 */
export function fmtLocalDateRangeLongID(start?: string | null, end?: string | null): string {
  const a = fmtLocalDateLongID(start);
  const b = fmtLocalDateLongID(end);
  if (a === '—' && b === '—') return '—';
  return `${a} s/d ${b}`;
}

export function formatToTimeString(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '';
}

export function formatToTimeStringLong(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

export function formatDateLong(src?: string | Date | null): string {
  if (!src) return '';

  const d = src instanceof Date ? src : parseApiDateTime(src);
  if (!d) return '';

  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateShort(src?: string | null): string {
  const d = parseApiDateTime(src);
  return d ? format(d, 'dd/MM/yyyy', { locale: localeID }) : '—';
}

export function calculateDays(start?: string | null, end?: string | null): number | null {
  const s = parseApiDateTime(start);
  const e = parseApiDateTime(end);
  if (!s || !e) return null;

  return differenceInCalendarDays(e, s) + 1;
}

export function getBackToWorkDate(endDate?: string | null): string {
  const end = parseApiDateTime(endDate);
  if (!end) return '';
  const backToWork = addDays(end, 1);

  return formatDateLong(backToWork.toISOString());
}

// date and time
export function formatDateTimeLong(src?: string | null): string {
  const d = parseApiDateTime(src);
  if (!d) return '';

  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

/** Format: 12/01/2026 14:35 */
export function formatDateTimeShort(src?: string | null): string {
  const d = parseApiDateTime(src);
  if (!d) return '';

  return format(d, 'dd/MM/yyyy HH:mm', { locale: localeID });
}

export function formatMonthYearID(ym?: string) {
  if (!ym) return '—';

  const d = parseApiDateTime(`${ym}-01`);
  return d ? format(d, 'MMMM yyyy', { locale: localeID }) : '—';
}
