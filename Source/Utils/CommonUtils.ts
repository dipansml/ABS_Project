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