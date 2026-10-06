// Indonesian date and time formatting utilities

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  
  const d = new Date(year, month - 1, day);
  const dayName = DAYS[d.getDay()];
  const monthName = MONTHS[month - 1];
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function formatIndonesianTime(timeStr: string): string {
  if (!timeStr) return '';
  return `${timeStr} WIB`;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextWeekendString(): string {
  const d = new Date();
  const currentDay = d.getDay(); // 0 is Sun, 6 is Sat
  const daysUntilSaturday = (6 - currentDay + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate Google Calendar Link
export function createGoogleCalendarUrl(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return '#';
  try {
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = timeStr.split(':');
    
    // Construct ISO format YYYYMMDDTHHmmSS
    const startIso = `${year}${month}${day}T${hours}${minutes}00`;
    // Assume 2 hour call
    const endHour = String((Number(hours) + 2) % 24).padStart(2, '0');
    const endIso = `${year}${month}${day}T${endHour}${minutes}00`;

    const title = encodeURIComponent('Video Call Santai sama Aa');
    const details = encodeURIComponent('Ngobrol seru dan santai via Video Call bareng Aa. Pastikan sudah siap cemilan dan santai hehe!');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`;
  } catch {
    return '#';
  }
}
