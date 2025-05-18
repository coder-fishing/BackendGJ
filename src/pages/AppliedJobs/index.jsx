import { useState, useEffect } from 'react';
import classNames from "classnames/bind";
import styles from "./AppliedJobs.module.scss";
import JobCard from '~/components/JobList/JobCard';
import axios from 'axios';
import { ClipLoader } from "react-spinners";
import { useAuth } from '~/utils/AuthContext';

const cx = classNames.bind(styles);

function AppliedJobs() {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser, isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            if (!currentUser) {
                setError('Please login to view applied jobs');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                const response = await axios.get(`http://localhost:8080/api/applications/applicant/${currentUser.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAppliedJobs(response.data || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching applied jobs:', err);
                setError('Failed to load applied jobs. Please try again later.');
                setLoading(false);
            }
        };

        if (isAuthenticated()) {
            fetchAppliedJobs();
        } else {
            setLoading(false);
            setError('Please log in to view applied jobs');
        }
    }, [currentUser, isAuthenticated]);

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <ClipLoader size={50} color="#007bff" loading={loading} />
            </div>
        );
    }

    if (error) {
        return <div className={cx('error-message')}>{error}</div>;
    }

    return (
        <section className={cx('container')}>
            <div className={cx('header')} data-aos="fade-up">
                <h1 className={cx('title')}>Applied Jobs</h1>
                <p className={cx('subtitle')}>Track your job applications</p>
            </div>
            
            {appliedJobs.length === 0 ? (
                <div className={cx('empty-state')} data-aos="fade-up">
                    <p>You haven't applied to any jobs yet.</p>
                    <p>When you find a job you're interested in, click Apply to submit your application.</p>
                </div>
            ) : (
                <div className={cx('jobs-grid')} data-aos="fade-up" data-aos-delay="200">
                    {appliedJobs.map((application, index) => (
                        <div 
                            key={application.id}
                            data-aos="fade-up"
                            data-aos-delay={200 + (index % 9) * 100}
                            className={cx('application-card')}
                        >
                            <JobCard job={application.job} />
                            <div className={cx('application-status')}>
                                <p>Applied on: {new Date(application.appliedAt).toLocaleDateString()}</p>
                                <p className={cx('status', application.status.toLowerCase())}>
                                    Status: {application.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default AppliedJobs; 