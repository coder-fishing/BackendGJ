import classNames from "classnames/bind";
import styles from "./Testinonailsection.module.scss";
import Testimonial from "~/components/Testimonial";

const cx = classNames.bind(styles);

function TestimonialSection() {
    return ( 
        <section className={cx("container")}>
             <div className={cx("header")}>
                <p className={cx("titleCenter")} data-aos="zoom-in"  data-aos-delay="700">Testimonials</p>
             </div>
             <div className={cx("main")} data-aos="zoom-in" data-aos-delay="1200">
                <Testimonial />
             </div>
        </section>
     );
}

export default TestimonialSection;