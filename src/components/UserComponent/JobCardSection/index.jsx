import classNames from "classnames/bind";
import styles from "./JobCardSection.module.scss";
import JobCardFake from "~/components/JobCardFake";
import Button from "~/components/Button";
import Image from "~/components/Image";
import icons from "~/assets/icons";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function JobCardSection() {    
    const navigate = useNavigate();
    return ( 
        <section className={cx("container")}>
            <div className={cx("header")} data-aos="zoom-in" data-aos-delay="500">
                <div className={cx("headerTitle")}>
                    <p className={cx("Title")}>
                       Featured Jobs
                    </p>
                </div>
                <div className={cx("headerDecr")}>
                    <p className={cx("decription")}>
                      Freshly released job applications
                    </p>
                </div>
                <div className=""></div>
            </div>
            <div className={cx("groupCard")} data-aos="fade-up" data-aos-delay="1400">
                <JobCardFake 
                    className={cx("groupCardItem")}
                    src={icons.instar}
                    name="TechCorp"
                    address="New York, NY"
                    position="Software Engineer"
                    shortdecr1="full-time"
                    shortdecr2="20000"
                    shortdecr3="23/12/2025"
                    decription="Join our dynamic team to build innovative solutions."
                    details={{
                        id: 1,
                        title: "Software Engineer",
                        description: "Join our dynamic team to build innovative solutions.",
                        requirements: "5+ years experience in software development. Strong knowledge of JavaScript and React. Experience with Node.js and databases. Excellent problem-solving skills. Good communication skills",
                        company_name: "TechCorp",
                        location: "New York, NY",
                        job_type: "full-time",
                        salary: "20000",
                        expires_at: "23/12/2025",
                        contact_email: "jobs@techcorp.com",
                        contact_phone: "+1 234-567-8900",
                        employer_id: "tech123"
                    }}
                /> 
                <JobCardFake 
                    className={cx("groupCardItem")}
                    src={icons.instar}
                    name="DataSolutions"
                    address="San Francisco, CA"
                    position="Data Analyst"
                    shortdecr1="full-time"
                    shortdecr2="20000"
                    shortdecr3="30/01/2025"
                    decription="Analyze data to drive business decisions."
                    details={{
                        id: 2,
                        title: "Data Analyst",
                        description: "Analyze data to drive business decisions.",
                        requirements: "3+ years experience in data analysis. Proficiency in SQL and Python. Experience with data visualization tools. Statistical analysis skills. Strong attention to detail",
                        company_name: "DataSolutions",
                        location: "San Francisco, CA",
                        job_type: "full-time",
                        salary: "20000",
                        expires_at: "30/01/2025",
                        contact_email: "careers@datasolutions.com",
                        contact_phone: "+1 234-567-8901",
                        employer_id: "data456"
                    }}
                />         
                <JobCardFake 
                    className={cx("groupCardItem")}
                    src={icons.instar}
                    name="InnovateX"
                    address="Austin, TX"
                    position="Product Manager"
                    shortdecr1="full-time"
                    shortdecr2="25000"
                    shortdecr3="07/01/2025"
                    decription="Manage product lifecycle from conception to launch."
                    details={{
                        id: 3,
                        title: "Product Manager",
                        description: "Manage product lifecycle from conception to launch.",
                        requirements: "4+ years product management experience. Experience with Agile methodologies. Strong leadership skills. Excellent communication abilities. Strategic thinking",
                        company_name: "InnovateX",
                        location: "Austin, TX",
                        job_type: "full-time",
                        salary: "25000",
                        expires_at: "07/01/2025",
                        contact_email: "pm@innovatex.com",
                        contact_phone: "+1 234-567-8902",
                        employer_id: "innov789"
                    }}
                />         
                <JobCardFake 
                    className={cx("groupCardItem")}
                    src={icons.instar}
                    name="CreativeHub"
                    address="Chicago, IL"
                    position="UX Designer"
                    shortdecr1="full-time"
                    shortdecr2="13000"
                    shortdecr3="19/01/2025"
                    decription="Design user-centric interfaces and experiences."
                    details={{
                        id: 4,
                        title: "UX Designer",
                        description: "Design user-centric interfaces and experiences.",
                        requirements: "3+ years UX design experience. Proficiency in Figma and Adobe Creative Suite. Experience with user research. Portfolio of work. Strong visual design skills",
                        company_name: "CreativeHub",
                        location: "Chicago, IL",
                        job_type: "full-time",
                        salary: "13000",
                        expires_at: "19/01/2025",
                        contact_email: "design@creativehub.com",
                        contact_phone: "+1 234-567-8903",
                        employer_id: "creative101"
                    }}
                />         
                <JobCardFake
                    className={cx("groupCardItem")}
                    src={icons.instar}
                    name="MarketPros"
                    address="Boston, MA"
                    position="Marketing Specialist"
                    shortdecr1="full-time"
                    shortdecr2="15000"
                    shortdecr3="30/12/2024"
                    decription="Develop and execute marketing strategies."
                    details={{
                        id: 5,
                        title: "Marketing Specialist",
                        description: "Develop and execute marketing strategies.",
                        requirements: "3+ years marketing experience. Experience with digital marketing platforms. Strong analytical skills. Content creation abilities. SEO knowledge",
                        company_name: "MarketPros",
                        location: "Boston, MA",
                        job_type: "full-time",
                        salary: "15000",
                        expires_at: "30/12/2024",
                        contact_email: "jobs@marketpros.com",
                        contact_phone: "+1 234-567-8904",
                        employer_id: "market202"
                    }}
                />         
                <JobCardFake 
                    className={cx("groupCardItem")}
                    src={icons.instar}
                    name="SalesForce"
                    address="Seattle, WA"
                    position="Sales Associate"
                    shortdecr1="full-time"
                    shortdecr2="10000"
                    shortdecr3="17/01/2025"
                    decription="Drive sales and build customer relationships."
                    details={{
                        id: 6,
                        title: "Sales Associate",
                        description: "Drive sales and build customer relationships.",
                        requirements: "2+ years sales experience. Strong communication skills. Experience with CRM software. Goal-oriented mindset. Team player",
                        company_name: "SalesForce",
                        location: "Seattle, WA",
                        job_type: "full-time",
                        salary: "10000",
                        expires_at: "17/01/2025",
                        contact_email: "sales@salesforce.com",
                        contact_phone: "+1 234-567-8905",
                        employer_id: "sales303"
                    }}
                />         
                
            </div>
            <div className={cx("footer")}>                                              
                <Button 
                    className={cx("button")}
                    rightIcon={<Image className={cx("icon")} src={icons.arrow_left1} />}
                    data-aos="zoom-in"
                    to="/user/jobs"    
                >
                    <span className={cx("text")}>Find More Jobs</span>
                </Button>
            </div>
        </section>
     );
}

export default JobCardSection;