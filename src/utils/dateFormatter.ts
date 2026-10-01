/**
 * Formats any date string, timestamp, or Date object into DD.MM.YYYY format
 * Examples:
 * '2026-10-01' -> '01.10.2026'
 * '2026-03-05' -> '05.03.2026'
 */
export function formatDDMMYYYY(dateInput?: string | Date | null): string {
  if (!dateInput) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  }

  if (typeof dateInput === 'string') {
    // If it's already in DD.MM.YYYY format
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateInput)) {
      return dateInput;
    }
    // Handle YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
    const isoMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${d}.${m}.${y}`;
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
