import { useEffect, useRef } from 'react';

/**
 * Hook để phát hiện khi người dùng click bên ngoài một phần tử
 * @param {Function} handler Hàm được gọi khi click bên ngoài
 * @param {Array} excludeRefs Mảng các refs của phần tử không nên kích hoạt click outside
 * @returns {React.RefObject} Ref để gắn vào phần tử cần theo dõi click outside
 */
const useClickOutside = (handler, excludeRefs = []) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra nếu ref đã được đặt và click không nằm trong phần tử đó
      if (ref.current && !ref.current.contains(event.target)) {
        // Kiểm tra các phần tử loại trừ
        const isExcluded = excludeRefs.some(
          (excludeRef) => excludeRef.current && excludeRef.current.contains(event.target)
        );

        if (!isExcluded) {
          handler();
        }
      }
    };

    // Thêm event listener khi component được mount
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Cleanup khi component bị unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, excludeRefs]);

  return ref;
};

export default useClickOutside; 