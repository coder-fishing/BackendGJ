import { useEffect, useState } from 'react';
import jobService from '../../services/jobService';

const JobExpirationChecker = () => {
  const [checkCount, setCheckCount] = useState(0);
  const MAX_RETRIES = 3;
  
  useEffect(() => {
    // Skip expiration check if we've already made several failed attempts
    if (checkCount >= MAX_RETRIES) {
      console.log("Job expiration check disabled after multiple failures");
      return;
    }
    
    const checkExpiredJobs = async () => {
      try {
        // Kiểm tra các job hết hạn
        const expiredJobs = await jobService.checkExpiredJobs();
        
        if (expiredJobs && expiredJobs.length > 0) {
          console.log('Found expired jobs:', expiredJobs.length);
          // Xóa các job hết hạn
          await jobService.deleteExpiredJobs();
          console.log('Successfully deleted expired jobs');
        }
      } catch (error) {
        console.error('Error handling expired jobs:', error);
        // Count this as a failed attempt
        setCheckCount(prev => prev + 1);
      }
    };

    // Đặt một timeout dài hơn trước khi kiểm tra lần đầu tiên
    const initialCheckTimeout = setTimeout(() => {
      checkExpiredJobs().catch(err => {
        console.error('Initial job expiration check failed:', err);
        setCheckCount(prev => prev + 1);
      });
    }, 30000); // 30 seconds delay to ensure other components load first

    // Thiết lập interval với tần suất thấp hơn
    const interval = setInterval(checkExpiredJobs, 12 * 60 * 60 * 1000); // 12 hours

    // Cleanup khi component unmount
    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(interval);
    };
  }, [checkCount]);

  // Component này không render gì cả
  return null;
};

export default JobExpirationChecker; 