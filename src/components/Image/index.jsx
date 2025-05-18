import { useState, forwardRef } from 'react';
import classNames from 'classnames/bind';
import images from '~/assets/images';
import styles from './Image.module.scss';

const cx = classNames.bind(styles);

// eslint-disable-next-line react/prop-types
const Image = forwardRef(({ src, alt, className, fallback: customFallback = images.noImage, ...props }, ref) => {
    const [fallback, setFallback] = useState('');
    const handleError = () => {
        setFallback(customFallback);
    };
    return (
        <img
            className={cx('wrapper', className)}
            ref={ref}
            src={fallback || src}
            alt={alt}
            {...props}
            onError={handleError}
        />
    );
});
Image.displayName = "Image";
export default Image;