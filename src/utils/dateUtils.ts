/**
 * Format date from YYYY-MM-DD to "Feb 12" format
 */
export function formatDateDisplay(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  
  return `${month} ${day}`;
}

/**
 * Format date from YYYY-MM-DD to dd/mm/yy
 */
export function formatDateDDMMYY(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  
  return `${day}/${month}/${year}`;
}

/**
 * Convert dd/mm/yy to YYYY-MM-DD for input value
 */
export function ddmmyyToISO(ddmmyy: string): string {
  if (!ddmmyy) return '';
  
  const parts = ddmmyy.split('/');
  if (parts.length !== 3) return '';
  
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
  
  return `${year}-${month}-${day}`;
}

/**
 * Get day of week from date string
 */
export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Check if date is weekend
 */
export function isWeekend(dateString: string): boolean {
  const day = getDayOfWeek(dateString);
  return day === 'Saturday' || day === 'Sunday';
}

/**
 * Format date range for week display
 */
export function formatWeekRange(startDate: string, endDate: string): string {
  const start = formatDateDisplay(startDate);
  const end = formatDateDisplay(endDate);
  return `${start} - ${end}`;
}