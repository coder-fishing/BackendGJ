/**
 * Format a date to show how long ago it happened
 * @param {Date|string} date - The date to format (Date object or ISO string)
 * @param {Object} options - Formatting options
 * @param {boolean} options.addSuffix - Whether to add 'ago' suffix (default: true)
 * @returns {string} - Formatted string like "2 minutes ago"
 */
export const formatTimeAgo = (date, options = { addSuffix: true }) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMilliseconds = now - past;
  
  // Convert to seconds
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  
  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  let timeAgo;
  
  if (diffInSeconds < minute) {
    timeAgo = diffInSeconds + ' giây';
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    timeAgo = minutes + ' phút';
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    timeAgo = hours + ' giờ';
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    timeAgo = days + ' ngày';
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    timeAgo = weeks + ' tuần';
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    timeAgo = months + ' tháng';
  } else {
    const years = Math.floor(diffInSeconds / year);
    timeAgo = years + ' năm';
  }
  
  if (options.addSuffix) {
    return timeAgo + ' trước';
  }
  
  return timeAgo;
};

/**
 * Format a date as dd/MM/yyyy HH:mm:ss
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDateTime = (date) => {
  const d = new Date(date);
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}; 