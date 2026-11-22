/**
 * @layer Core (Utils)
 * @responsibility Shared date, formatting, and numeric calculation helpers.
 */

/**
 * Formats a Date object to YYYY-MM-DD string format.
 * @param {Date} [date=new Date()] Date to format.
 * @returns {string} Formatted date string (YYYY-MM-DD).
 */
export function formatDate(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
