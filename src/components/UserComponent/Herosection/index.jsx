import classNames from "classnames/bind";
import styles from "./Herosection.module.scss";
import Button from "~/components/Button";
import Image from "~/components/Image";
import Search from "~/components/SearchUser";
import images from "~/assets/images";
import icons from "~/assets/icons";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function HeroSection() {
    const navigate = useNavigate();
    const jobNames1 = [
        "Web Developer",
        "Front End Developer",
        "Data Analyst",
        "Accountant",
        
    ];
    const jobNames2 = [
        "Photographer",
        "Full Stack Developer",
        "Senior Lecturer",
        "UX Designer",
    ]

    useEffect(() => {
        AOS.init();
    }, []);

    const handleClick = (jobName) => {
        navigate(`/user/jobs?search=${jobName}`);
    };

    return (
        <section className={cx("heroSection")}>
            <div className={cx("heroSectionFindApply")}>
                <div className={cx("findAndApply")}>
                    <div className={cx("findAndApplyContent")} data-aos="fade-up">
                        <h1 className={cx("findAndApplyContentTitle")}>
                            Find and Apply for a Job that suits <br />
                            you!
                        </h1>
                        <p className={cx("findAndApplyContentDescription")}>
                            Here you can find your best job, Explore hundreds of <br />
                            jobs with us. Ready for your next adventure?
                        </p>
                    </div>
                    <div className={cx("searchBar")} data-aos="fade-up">
                        <Search />
                    </div>
                </div>

                <div
                    className={cx("quickSearch")}
                    data-aos="flip-left"
                    data-aos-easing="ease-out-cubic"
                    data-aos-duration="2000"
                >
                    <div className={cx("quickSearchTitle")}>
                        <h2 className={cx("content")}>Most Searched Jobs:</h2>
                    </div>
                    <div className={cx("quickSearchResult")}>
                        <div className={cx("tear")}>
                            {jobNames1.map((jobName) => (
                                <div
                                    key={jobName}
                                    className={cx("quickSearchResultItem")}
                                    onClick={() => handleClick(jobName)}
                                >
                                    <h3>{jobName}</h3>
                                </div>
                            ))}
                        </div>
                        <div className={cx("tear")}>
                            {jobNames2.map((jobName) => (
                                <div
                                    key={jobName}
                                    className={cx("quickSearchResultItem")}
                                    onClick={() => handleClick(jobName)}
                                >
                                    <h3>{jobName}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx("heroSectionContent")}>
                <figure className={cx("heroSectionContentImage")}>
                    <Image
                        src={images.blackMan}
                        alt="black_man"
                        className={cx("black_man")}
                        data-aos="fade-up"
                        data-aos-anchor-placement="center-bottom"
                    />
                </figure>
                <div className={cx("heroSectionContentCongratulations")} data-aos="fade-right">
                    <Image
                        src={icons.email}
                        className={cx("imageLeft")}
                        alt="email"
                    />
                    <div className={cx("heroSectionContentCongratulationsContent")}>
                        <h5 className={cx("textHight")}>Congratulations!</h5>
                        <h5 className={cx("text")}>You have got an Email</h5>
                    </div>
                    <img className={cx("imageRight")} src={icons.tick} alt="tick" />
                </div>
                <div className={cx("heroSectionContentFeedback")} data-aos="fade-left">
                    <img
                        className={cx("heroSectionContentFeedbackImage")}
                        src={icons.ellipse1}
                        alt="ellipse1"
                    />
                    <h5 className={cx("heroSectionContentFeedbackText")}>
                        Hello, I am looking to apply for the role of a UX Designer
                    </h5>
                </div>
                <div className={cx("heroSectionContentMember")} data-aos="fade-left">
                    <h4 className={cx("number")}>200+</h4>
                    <h5 className={cx("descr")}>Got job on our platform</h5>
                    <div className={cx("groupImage")}>
                        {[
                            icons.ellipse4,
                            icons.ellipse5,
                            icons.ellipse7,
                            icons.ellipse8,
                            icons.ellipse9,
                            icons.ellipse10,
                            icons.plus,
                        ].map((icon, index) => (
                            <Image key={index} src={icon} alt={`icon-${index}`} />
                        ))}
                    </div>
                </div>
                <div className={cx("heroSectionContentJobs")} data-aos="fade-right">
                    <div className={cx("heroSectionContentJobsHeader")}>
                        <div className={cx("Logo")}>
                            <Image
                                src={icons.logo1}
                                alt="logo1"
                                className={cx("logo1")}
                            />
                            <h4 className={cx("logoName")}>Kokomlemle</h4>
                        </div>
                        <Button outline>Full Time</Button>
                    </div>
                    <div className={cx("heroSectionContentJobsContent")}>
                        <h5 className={cx("contentName")}>Graphic Designer</h5>
                        <h6 className={cx("normal")}>
                            The company seeks to employ the <br />
                            services of a......<span className={cx("highlight")}>Read More</span>
                        </h6>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
