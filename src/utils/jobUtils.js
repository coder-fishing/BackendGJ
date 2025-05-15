/**
 * Helper functions for job-related operations
 */

export const getStatusClass = (status) => {
  switch (status) {
    case 'PENDING':
      return 'status-pending';
    case 'APPROVED':
      return 'status-approved';
    case 'REJECTED':
      return 'status-rejected';
    case 'DELETED':
      return 'status-deleted';
    default:
      return 'status-unknown';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'Đã duyệt';
    case 'PENDING':
      return 'Đang chờ';
    case 'REJECTED':
      return 'Từ chối';
    case 'DELETED':
      return 'Đã xóa';
    default:
      return status;
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const formatSalary = (min, max, currency) => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
    maximumFractionDigits: 0
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
};

export const formatSalaryUpto = (max, currency = 'VND') => {
  if (max >= 1_000_000) {
    const rounded = Math.round(max / 1_000_000);
    return `Upto ${rounded}M ${currency}`;
  } else if (max >= 10_000) {
    const rounded = Math.round(max / 1_000);
    return `Upto ${rounded}K ${currency}`;
  } else {
    const value = Math.round(max).toLocaleString('vi-VN');
    return `Upto ${value} ${currency}`;
  }
};


export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}; 