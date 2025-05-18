import { useState, useReducer, useEffect } from 'react';
import classNames from "classnames/bind";
import styles from "./JobCard.module.scss";
import Modal from 'react-modal';
import { IoReturnDownBackOutline } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { useAuth } from '~/utils/AuthContext';
import Image from "~/components/Image";
import Button from "~/components/Button";
import axios from 'axios';
import { format } from 'date-fns';
import icons from '~/assets/icons';
import applicationService from '~/services/applicationService';

const cx = classNames.bind(styles);

const stepReducer = (state, action) => {
    switch (action.type) {
        case "NEXT":
            return {
                step: Math.min(state.step + 1, 3),
                progressPercentage: Math.min(state.progressPercentage + 30, 100),
            };
        case "PREV":
            return {
                step: Math.max(state.step - 1, 1),
                progressPercentage: Math.max(state.progressPercentage - 30, 30),
            };
        case "RESET":
            return { step: 1, progressPercentage: 30 };
        default:
            return state;
    }
};

function JobCard({ job }) {
    const { currentUser } = useAuth();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [applyModalIsOpen, setApplyModalIsOpen] = useState(false);
    const [employerInfo, setEmployerInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resume, setResume] = useState("");
    const [cvFile, setCvFile] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [stepState, dispatch] = useReducer(stepReducer, { step: 1, progressPercentage: 30 });

    // Check if job is saved when component mounts
    useEffect(() => {
        const checkSavedStatus = async () => {
            if (!currentUser) return;
            
            try {
                const response = await axios.get(`http://localhost:8080/api/saved-jobs/user/${currentUser.id}`);
                const savedJobs = response.data;
                console.log('Saved jobs:', savedJobs);
                setIsSaved(savedJobs.some(savedJob => savedJob.jobId === job.jobId));
            } catch (error) {
                console.error('Error checking saved status:', error);
            }
        };

        checkSavedStatus();
    }, [currentUser, job.jobId]);

    const handleToggleSave = async () => {
        if (!currentUser) {
            alert("Please login to save jobs");
            return;
        }

        try {
            await axios.post(`http://localhost:8080/api/saved-jobs/toggle/${job.jobId}/user/${currentUser.id}`);
            setIsSaved(!isSaved);
            alert(isSaved ? "Job removed from saved jobs" : "Job saved successfully!");
        } catch (error) {
            console.error('Error toggling save status:', error);
            alert("Failed to save job. Please try again.");
        }
    };

    const formatSalary = (min, max, currency) => {
        if (!min && !max) return 'Negotiable';
        if (!max) return `Up to ${currency} ${min.toLocaleString()}`;
        if (!min) return `Up to ${currency} ${max.toLocaleString()}`;
        if (min === max) return `${currency} ${min.toLocaleString()}`;
        return `Up to ${currency} ${max.toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size <= 9 * 1024 * 1024) {
            setCvFile(file);
        } else {
            alert("File size must be less than 9MB");
        }
    };

    const openApplyModal = () => {
        if (!currentUser) {
            alert("Please login to apply for this job");
            return;
        }

        // First close the view modal if it's open
        setModalIsOpen(false);
        // Reset the apply form state
        dispatch({ type: "RESET" });
        setCvFile(null);
        setResume("");
        // Open the apply modal immediately
        setApplyModalIsOpen(true);
        
        // Then fetch employer info
        fetchEmployerInfo();
    };

    const fetchEmployerInfo = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const response = await axios.get(`http://localhost:8080/api/user/${job.employerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.status === 200) {
                setEmployerInfo(response.data);
            } else {
                throw new Error("Failed to fetch employer info");
            }
        } catch (err) {
            console.error("Error fetching employer information:", err);
            setEmployerInfo(null);
        }
    };

    const handleApplySubmit = async () => {
        if (!currentUser) {
            alert("Please login to apply for this job");
            return;
        }

        if (!cvFile) {
            alert("Please upload your CV first");
            return;
        }

        setIsLoading(true);
        try {
            await applicationService.applyForJob(
                job.jobId,
                currentUser.id,
                resume,
                cvFile
            );
            
            alert("Application submitted successfully!");
            closeApplyModal();
        } catch (error) {
            console.error("Error submitting application:", error);
            alert(error.response?.data?.message || "Failed to submit application. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => setModalIsOpen(false);
    
    const closeApplyModal = () => {
        setApplyModalIsOpen(false);
        setEmployerInfo(null);
        setCvFile(null);
        setResume("");
        dispatch({ type: "RESET" });
        setIsLoading(false);
    };

    return (
        <div className={cx("container")} data-aos="fade-up">
            <div className={cx("header")}>
                <div className={cx("wrapper")}>
                    <Image 
                        className={cx("logo")} 
                        src={job.imageUrl || job.employerImageUrl || job.companyLogo || icons.logo} 
                        alt={job.employerName} 
                    />
                    <div className={cx("group")}>
                        <div className={cx("name")}>{job.employerName}</div>
                        <div className={cx("address")}>{job.location}</div>
                    </div>
                </div>
            </div>
            <Image 
                src={isSaved ? icons.saved : icons.save} 
                className={cx("save")} 
                onClick={handleToggleSave}
            />
            <div className={cx("content")}>
                <div className={cx("position")}>
                    <p className={cx("title")}>{job.title}</p>
                </div>
                <div className={cx("threeShortdecr")}>
                    <div className={cx("shortdecr")}>
                        <p className={cx("shortdecrcontent")}>{job.jobType}</p>
                    </div>
                    <div className={cx("shortdecr")}>
                        <p className={cx("shortdecrcontent")}>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
                    </div>
                    <div className={cx("shortdecr")}>
                        <p className={cx("shortdecrcontent")}>{formatDate(job.expireAt)}</p>
                    </div>
                </div>
                <div className={cx("longdecr")}>
                    <p className={cx("description")}>{job.description}</p>
                </div>
            </div>
            <div className={cx("footer")}>
                <Button primary className={cx("buttonApply")} onClick={openApplyModal}>Apply</Button>
                <Button outline className={cx("buttonReadMore")} onClick={() => setModalIsOpen(true)}>View</Button>
            </div>

            {/* Job Details Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Job Details"
                className={cx("modal")}
                overlayClassName={cx("overlay")}
                ariaHideApp={false}
            >
                <ul className={cx("content")}>
                    <h2 className={cx("header")}>{job.title}</h2>
                    <li className={cx("info")}>{job.description}</li>

                    <li className={cx("info")}>
                        <strong>Requirements:</strong>
                        <p>{job.requirement}</p>
                    </li>

                    <li className={cx("info")}>
                        <strong>Company Info:</strong> {job.employerName}
                    </li>
                    <li className={cx("info")}>
                        <strong>Location:</strong> {job.location}
                    </li>
                    <li className={cx("info")}>
                        <strong>Employment Type:</strong> {job.jobType}
                    </li>
                    <li className={cx("info")}>
                        <strong>Salary:</strong> {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </li>
                    <li className={cx("info")}>
                        <strong>Posted:</strong> {formatDate(job.postedAt)}
                    </li>
                    <li className={cx("info")}>
                        <strong>Expires:</strong> {formatDate(job.expireAt)}
                    </li>
                    <li className={cx("info")}>
                        <strong>Views:</strong> {job.viewCount}
                    </li>
                    <li className={cx("info")}>
                        <strong>Applications:</strong> {job.applyCount}
                    </li>

                    <Button primary onClick={openApplyModal} className={cx("btnApplyhi")}>
                        Apply
                    </Button>
                </ul>
            </Modal>

            {/* Apply Modal */}
            <Modal
                isOpen={applyModalIsOpen}
                onRequestClose={closeApplyModal}
                contentLabel="Apply for Job"
                className={cx("modal")}
                overlayClassName={cx("overlay")}
                ariaHideApp={false}
            >
                <div className={cx("containermodel")}>
                    <div className={cx("step")}>
                        Step {stepState.step} of 3
                    </div>
                    <div className={cx("bar")}>
                        <div
                            className={cx("progressBar")}
                            style={{ width: `${stepState.progressPercentage}%` }}
                        ></div>
                    </div>

                    {/* Step 1: Upload CV */}
                    {stepState.step === 1 && (
                        <div className={cx("content")}>
                            <h3 className={cx("contentitem")}>Upload Your CV</h3>
                            <h5 className={cx("contentitem")}>
                                Employers use your CV to determine whether you have the right experience
                                for the job.
                            </h5>
                            <h5>This file &lt; 9MB </h5>
                            <input type="file" onChange={handleFileChange} required/>
                            <Button
                                primary
                                className={cx("Button")}
                                onClick={() => dispatch({ type: "NEXT" })}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Supporting Documents */}
                    {stepState.step === 2 && (
                        <div className={cx("content")}>
                            <h3>Do you have any supporting documents?</h3>
                            <textarea
                                className={cx("resume")}
                                onChange={(e) => setResume(e.target.value)}
                            />
                            <IoReturnDownBackOutline
                                onClick={() => dispatch({ type: "PREV" })}
                                className={cx("btnBack")}
                            />
                            <Button
                                primary
                                className={cx("Button")}
                                onClick={() => dispatch({ type: "NEXT" })}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                    {/* Step 3: Confirm Information */}
                    {stepState.step === 3 && (
                        <div className={cx("content")}>
                            <h3>Confirm your information</h3>
                            <p>Your name: {currentUser?.displayName}</p>
                            <p>Your email: {currentUser?.email}</p>
                            <IoReturnDownBackOutline
                                onClick={() => dispatch({ type: "PREV" })}
                                className={cx("btnBack")}
                            />
                            <Button outline className={cx("Button1")} onClick={closeApplyModal}>
                                Cancel
                            </Button>
                            <Button
                                primary
                                className={cx("Button")}
                                onClick={handleApplySubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ClipLoader size={20} color="#fff" loading={isLoading} />
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

export default JobCard; 