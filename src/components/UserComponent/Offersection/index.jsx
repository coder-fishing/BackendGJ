import classNames from "classnames/bind";

import styles from "./Offersection.module.scss";
import Image from "~/components/Image";
import images from "~/assets/images";
import icons from "~/assets/icons";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const cx = classNames.bind(styles);

function OfferSection() {
   useEffect(() => {
      AOS.init(); 
    }, []);
    return ( 
        <section className={cx("container")}>
             <div className={cx("glassMan")}>
                <Image src={images.glassMan} 
                       className={cx("glassManImage")} 
                       data-aos="fade-up"   
                       data-aos-delay="1000"   
                       data-aos-duration="5000"                                  
                       >
               </Image>                                                                                            
            </div>                                                                                 
             <div className={cx("wrapper")}>               
                   <div className={cx("dicribe")} data-aos="fade-up">
                        <div className={cx("header")} >
                            <p className={cx("title")}>What we offer:</p>
                        </div>
                        <div className={cx("content")}>
                           <p className={cx("title")}> 
                              Solutions that will take your recruitment <br />
                              to the next level!
                            </p>                  
                        </div>
                        <div className={cx("footer")}>
                            <p className={cx("decription")}>
                            We build effective strategies that will help you reach <br />
                            employers worldwide.
                            </p>
                        </div>   
                   </div>  
                   <div className={cx("groupCard")}>
                      <div className={cx("groupCardNormal")} data-aos="fade-right">
                         <Image src={icons.black_cv} className={cx("groupCardNormalImage")}></Image>
                         <div className={cx("groupCardNormalContent")}>
                            <p className={cx("groupCardNormalContentTitle")}>CV Build</p>
                            <div className="groupCardNormalContent1">
                                <p className={cx("decription")}>
                                We will design a job awarding professional Curriculum Vitae 
                                </p>
                            </div>
                         </div>
                      </div>
                      <div className={cx("groupCardHighlight")} data-aos="fade-left">
                      <Image src={icons.courses} className={cx("groupCardHighlightImage")}></Image>
                         <div className={cx("groupCardHighlightContent")}>
                            <p className={cx("groupCardHighlightContentTitle")}>Courses</p>
                            <div className="groupCardHighlightContent1">
                                <p className={cx("decription")}>
                                We offer online courses that will help you build your portfolio
                                </p>
                            </div>
                         </div>
                      </div>
                      <div className={cx("groupCardNormal")} data-aos="fade-right">
                      <Image src={icons.black_cv} className={cx("groupCardNormalImage")}></Image>
                         <div className={cx("groupCardNormalContent")}>
                            <p className={cx("groupCardNormalContentTitle")}>Seminars</p>
                            <div className="groupCardNormalContent1">
                                <p className={cx("decription")}>
                                We will design a job awarding professional Curriculum Vitae 
                                </p>
                            </div>
                         </div>
                      </div>
                      <Image src={icons.curve_up} className={cx("curve_up")} data-aos="fade-left"></Image>
                      <Image src={icons.curve_down} className={cx("curve_down")} data-aos="fade-left"></Image>
                   </div>           
             </div>
        </section>
     );
}

export default OfferSection;