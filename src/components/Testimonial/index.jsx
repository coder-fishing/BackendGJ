import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./Testimonial.module.scss";
import Image from "~/components/Image";
import icons from "~/assets/icons";

const cx = classNames.bind(styles);

const testimonials = [
  {
    description: "I had the privilege of using Job Hunt to search for employment, and it exceeded my expectations. The platform's user-friendly features and the vast array of job listings made my job search a success. I endorse Job Hunt wholeheartedly.",
    author: "Emmanuel Rice",
    role: "Product Manager"
  },
  {
    description: "Job Hunt helped me find my dream job within weeks. The platform is easy to use and provides a vast amount of job listings. I highly recommend it to anyone seeking new opportunities in their career. The support team is also incredibly responsive and helpful.",
    author: "Sarah Johnson",
    role: "Software Engineer"
  },
  {
    description: "I was able to secure a job within a month of using Job Hunt. The platform is intuitive and easy to navigate, and the job listings are updated regularly. I am grateful for the support I received from the team and would recommend Job Hunt to anyone looking for a new job.",
    author: "John Doe",
    role: "Data Analyst"
  },
  {
    description: "I had the privilege of using Job Hunt to search for employment, and it exceeded my expectations. The platform's user-friendly features and the vast array of job listings made my job search a success. I endorse Job Hunt wholeheartedly.",
    author: "Emmanuel Rice",
    role: "Product Manager"
  },
  {
    description: "Job Hunt has been an invaluable tool for finding the right job. The ease of use and the wide range of listings made my search much easier. Highly recommended!",
    author: "Ava Martin",
    role: "Software Engineer"
  },
  {
    description: "The platform's clean design and intuitive interface made my job search process smooth and efficient. Job Hunt is definitely the best resource I’ve used.",
    author: "Liam Smith",
    role: "UX/UI Designer"
  },
  {
    description: "I found my dream job through Job Hunt! The search filters are powerful, and the application process is seamless. I’m grateful for this platform!",
    author: "Sophia Lee",
    role: "Data Analyst"
  },
  {
    description: "As a recent graduate, Job Hunt helped me navigate the job market with ease. The variety of job listings gave me many options to choose from.",
    author: "James Brown",
    role: "Marketing Specialist"
  },
  {
    description: "The experience with Job Hunt was exceptional. The platform allowed me to filter opportunities based on my skill set, making it easy to find a suitable role.",
    author: "Isabella Harris",
    role: "Product Manager"
  },
  {
    description: "I’ve tried several job platforms, but none have been as effective as Job Hunt. I found a job within a month, and the entire process was hassle-free.",
    author: "Benjamin Johnson",
    role: "Project Manager"
  },
  {
    description: "Job Hunt’s job search function is top-notch! The detailed filters and job matching system helped me find exactly what I was looking for.",
    author: "Olivia Clark",
    role: "HR Specialist"
  },
  {
    description: "I’m impressed by how quickly I was able to land interviews through Job Hunt. The platform’s user interface is easy to use and the support team is always helpful.",
    author: "Noah Walker",
    role: "Business Analyst"
  },
  {
    description: "Thanks to Job Hunt, I was able to find a job in just a few weeks. The job listings are up-to-date and comprehensive. I highly recommend it to anyone looking for a job.",
    author: "Mason Lewis",
    role: "Web Developer"
  },
  {
    description: "Job Hunt is the best platform I’ve used to search for jobs. The job recommendations based on my profile were spot-on, and I found the perfect role.",
    author: "Mia Robinson",
    role: "Graphic Designer"
  }

  // Add more testimonials if needed
];

const CHAR_LIMIT = 200; // Set character limit for truncated text

function Testimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
    setIsExpanded(false); // Reset expansion when switching testimonials
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    setIsExpanded(false); // Reset expansion when switching testimonials
  };

  const toggleExpanded = () => {
    setIsExpanded((prevExpanded) => !prevExpanded);
  };

  const { description, author, role } = testimonials[currentIndex];
  const isLongText = description.length > CHAR_LIMIT;
  const displayedText = isExpanded || !isLongText
    ? description
    : `${description.slice(0, CHAR_LIMIT)}...`;

  return (
    <div className={cx("container")}>
      <p className={cx("title")}>What our clients are saying</p>
      <p className={cx("description")}>
        &quot;{displayedText}&quot;
        {isLongText && (
          <button onClick={toggleExpanded} className={cx("toggle-button")}>
            {isExpanded ? " Show less" : " Read more"}
          </button>
        )}
      </p>
      <h3 className={cx("author")}>{author}</h3>
      <p className={cx("role")}>{role}</p>
      <div className={cx("navigation")}>
        <button onClick={handlePrevious} className={cx("nav-button")}>
            <Image src={icons.arrow_left} alt="Previous" className={cx("buttonPrevious")} />          
        </button>
        <button onClick={handleNext} className={cx("nav-button")}>
            <Image src={icons.arrow_right} alt="Next" className={cx("buttonNext")}/>
        </button>
      </div>
    </div>
  );
}

export default Testimonial;
