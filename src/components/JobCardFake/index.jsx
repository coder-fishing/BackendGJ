import classNames from "classnames/bind";
import styles from "./JobCard.module.scss";
import Image from "~/components/Image";
import icons from "~/assets/icons";
import Button from "~/components/Button";
import { useState, useReducer } from "react";
import axios from "axios";
import Modal from "react-modal";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { useAuth } from "~/utils/AuthContext";

const cx = classNames.bind(styles);

// eslint-disable-next-line react/prop-types
function JobCardFake({ src, name, address, position, shortdecr1, shortdecr2, shortdecr3, decription, onClick, details }) {
    const { currentUser } = useAuth();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [applyModalIsOpen, setApplyModalIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(undefined);
    const [employerInfo, setEmployerInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resume, setResume] = useState("");
    const [cvFile, setCvFile] = useState(null);
    const employerCache = {};
    const initialState = { step: 1, progressPercentage: 30 };
    const totalSteps = 3;

    const stepReducer = (state, action) => {
        switch (action.type) {
          case "NEXT":
            return {
              step: Math.min(state.step + 1, totalSteps),
              progressPercentage: Math.min(state.progressPercentage + 30, 100),
            };
          case "PREV":
            return {
              step: Math.max(state.step - 1, 1),
              progressPercentage: Math.max(state.progressPercentage - 30, 30),
            };
          case "RESET":
            return initialState;
          default:
            return state;
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };
    
    const closeApplyModal = () => {
        setApplyModalIsOpen(false);
        setEmployerInfo(null);
        setCvFile(null);
        setResume(null);
        dispatch({ type: "RESET" });
        setIsLoading(false);
    };

    const [stepState, dispatch] = useReducer(stepReducer, initialState);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size <= 9 * 1024 * 1024) {
            setCvFile(file);
        } else {
            alert("File size must be less than 9MB");
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
            const formData = new FormData();
            formData.append("cv", cvFile);
            formData.append("resume", resume);
            formData.append("job_id", details.id);
            formData.append("user_id", currentUser.id);

            const response = await axios.post("http://localhost:8000/api/applications", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });

            if (response.status === 200) {
                alert("Application submitted successfully!");
                closeApplyModal();
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const openApplyModal = async (details) => {
        if (!currentUser) {
            alert("Please login to apply for this job");
            return;
        }

        try {
            dispatch({ type: "RESET" });
            setModalIsOpen(false);
            setApplyModalIsOpen(true);

            const employerId = details.employer_id;
            if (employerCache[employerId]) {
                setEmployerInfo(employerCache[employerId]);
            } else {
                const response = await axios.get(`http://localhost:8000/api/user/${employerId}`, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
                if (response.status === 200) {
                    employerCache[employerId] = response.data.user;
                    setEmployerInfo(response.data.user);
                } else {
                    console.error("Failed to fetch employer info.");
                }
            }
        } catch (err) {
            console.error("Error fetching employer information:", err);
        }
    };

    return (
        <div className={cx("container")} onClick={onClick}>
            <div className={cx("header")}>
                <div className={cx("wrapper")}>
                    <Image  
                        className={cx("logo")}
                        src={src}
                    />
                    <div className={cx("group")}>
                        <div className={cx("name")}>{name}</div>
                        <div className={cx("address")}>
                            {address}
                        </div>
                    </div>
                </div>    
            </div>
            <Image src={icons.save} className={cx("save")}/>
            <div className={cx("content")}>
                <div className={cx("position")}>
                    <p className={cx("title")}>
                        {position}
                    </p>                  
                </div>
                <div className={cx("threeShortdecr")}>
                    <div className={cx("shortdecr")}>
                        <p className={cx("shortdecrcontent")}>{shortdecr1}</p>
                    </div>
                    <div className={cx("shortdecr")}>
                        <p className={cx("shortdecrcontent")}>{shortdecr2}</p>
                    </div>
                    <div className={cx("shortdecr")}>
                        <p className={cx("shortdecrcontent")}>{shortdecr3}</p>
                    </div>
                </div>
                <div className={cx("longdecr")}>
                    <p className={cx("decription")}>
                        {decription}
                    </p>
                </div>
            </div>
            <div className={cx("footer")}>
                <Button className={cx("buttonApply")} onClick={() => setApplyModalIsOpen(true)} to="/user/jobs">Apply</Button>
                <Button className={cx("buttonReadMore")} onClick={() => setModalIsOpen(true)} outline to="/user/jobs">View</Button>
            </div>

            {/* Modal Hiển thị Chi Tiết Công Việc */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Job Details"
                className={cx("modal")}
                overlayClassName={cx("overlay")}
                ariaHideApp={false}
            >
                <ul className={cx("content")}>
                    <h2 className={cx("header")}>{details?.title || name}</h2>
                    <li className={cx("info")}>{details?.description || decription}</li>

                    <li className={cx("info")}>
                        <strong>Requirements:</strong>
                        {details?.requirements
                            ? details.requirements.split(".").map((req, index) => (
                                <ul key={index}>
                                    <li>{req.trim()}</li>
                                </ul>
                            ))
                            : "N/A"}
                    </li>

                    <li className={cx("info")}>
                        <strong>Company Info:</strong> {details?.company_name || position}
                    </li>
                    <li className={cx("info")}>
                        <strong>Location:</strong> {details?.location || address}
                    </li>
                    <li className={cx("info")}>
                        <strong>Employment Type:</strong> {details?.job_type || shortdecr1}
                    </li>
                    <li className={cx("info")}>
                        <strong>Salary:</strong> {details?.salary || shortdecr2}
                    </li>
                    <li className={cx("info")}>
                        <strong>Expries at:</strong> {details?.expires_at || shortdecr3}
                    </li>
                    <li className={cx("info")}>
                        <strong>Contact Email:</strong> {details?.contact_email || "N/A"}
                    </li>
                    <li className={cx("info")}>
                        <strong>Contact Phone:</strong> {details?.contact_phone || "N/A"}
                    </li>

                    {details && (
                        <Button to="/user/jobs" onClick={() => openApplyModal(details)} classNames={cx("btnApplyhi")}>
                            Apply
                        </Button>
                    )}
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
                {employerInfo ? (
                    <div className={cx("containermodel")}>
                        <div className={cx("step")}>
                            Step {stepState.step} of {totalSteps}
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
                                <Button className={cx("Button1")} onClick={closeApplyModal}>
                                    Cancel
                                </Button>
                                <Button
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
                ) : (
                    <ClipLoader className={cx("spinner")} />
                )}
            </Modal>
        </div>
    );
}

export default JobCardFake;