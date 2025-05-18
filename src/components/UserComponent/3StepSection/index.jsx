import icons from "~/assets/icons";
import Image from "~/components/Image";
import styles from "./Step.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

function Step() {
    return ( 
        <section className={cx("container")}>
            <div className={cx("header")} data-aos="fade-up" data-aos-delay="700">
                <p className={cx("titleCenter")}>
                    Only 3 Steps to Get Your Dream Job!
                </p>
            </div>
            <div className={cx("content")}>
                <div className={cx("card")} data-aos="fade-up-right" data-aos-delay="1000">
                    <Image src={icons.account} alt="Register for an account" />
                    <p className={cx("name")}>Register for an account</p>
                    <p className={cx("step")}>1</p>
                </div>
                <div className={cx("card")} data-aos="fade-up" data-aos-delay="1300">
                    <Image src={icons.white_cv} alt="Upload Your CV" />
                    <p className={cx("name")}>Upload Your CV</p>
                    <p className={cx("step")}>2</p>
                </div>
                <div className={cx("card")} data-aos="fade-up-left" data-aos-delay="1600">
                    <Image src={icons.send} alt="Apply For Dream Job!" />
                    <p className={cx("name")}>Apply For Dream Job!</p>
                    <p className={cx("step")}>3</p>
                </div>
            </div>
        </section>
    );
}

export default Step;
