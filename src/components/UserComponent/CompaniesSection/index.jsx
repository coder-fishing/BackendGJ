import classNames from "classnames/bind";
import styles from "./Companiessection.module.scss";
import Image from "~/components/Image";
import icons from "~/assets/icons";

const cx = classNames.bind(styles);
function ConpaniesSection() {
    return ( 
        <section className={cx("container")}>
            <div className={cx("header")} data-aos="zoom-in"  data-aos-delay="300">
                <p className={cx("titleCenter")}>
                    We are trusted by the World’s largest companies 
                </p>
            </div>
            <div className={cx("content")}>
                <Image src={icons.yahoo} data-aos="fade-right" data-aos-delay="500"/>
                <Image src={icons.microsoft} data-aos="fade-right" data-aos-delay="800"  />
                <Image src={icons.youtube} data-aos="fade-up" data-aos-delay="1100"/>
                <Image src={icons.lenovo} data-aos="fade-left" data-aos-delay="1400"/>
                <Image src={icons.samsung} data-aos="fade-left" data-aos-delay="1700"/>               
            </div>

        </section>
     );
}

export default ConpaniesSection;