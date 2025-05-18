import styles from './NotificationSection.module.scss';
import classNames from 'classnames/bind';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

function NotificationSection() {
    return ( 
        <section className={cx("container")} data-aos="zoom-in" data-aos-delay="2000">
            <div className={cx("content")}>
                <div className={cx("header")} >
                    <p className={cx("meassage")}>Want to get notified on <br />    
                    every Job Posting?</p>
                </div>  
                <div className={cx("input")}>
                    <input className={cx("inputName")} type="text" placeholder='Enter Your Email Address'/>
                    <Button className={cx("inputButttonSubcribe")} outline>Subscribe</Button>
                </div>                                                                              
            </div>
        </section>
     );
}

export default NotificationSection;