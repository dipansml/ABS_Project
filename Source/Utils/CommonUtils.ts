export const formatToMMDDYYYY = (date: Date): string => {
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
};

export const formatToYYYYMMDD = (date: Date): string => {
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

export const formatToDDMMYYYY = (date: string) => {
  if (!date) return '';

  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
};

export const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));

  const h = Math.floor(total / 3600);

  const m = Math.floor((total % 3600) / 60);

  const s = total % 60;

  const parts: string[] = [];

  if (h > 0) {
    parts.push(`${h}h`);
  }

  if (m > 0) {
    parts.push(`${m}m`);
  }

  if (s > 0 || parts.length === 0) {
    parts.push(`${s}s`);
  }

  return parts.join(' ');
};