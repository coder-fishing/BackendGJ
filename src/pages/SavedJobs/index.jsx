import { useState, useEffect } from 'react';
import classNames from "classnames/bind";
import styles from "./SavedJobs.module.scss";
import JobCard from '~/components/JobList/JobCard';
import axios from 'axios';
import { ClipLoader } from "react-spinners";
import { useAuth } from '~/utils/AuthContext';

const cx = classNames.bind(styles);

function SavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser, isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchSavedJobs = async () => {
            if (!currentUser) {
                setError('Please login to view saved jobs');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                const response = await axios.get(`http://localhost:8080/api/saved-jobs/user/${currentUser.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSavedJobs(response.data || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching saved jobs:', err);
                setError('Failed to load saved jobs. Please try again later.');
                setLoading(false);
            }
        };

        if (isAuthenticated()) {
            fetchSavedJobs();
        } else {
            setLoading(false);
            setError('Please log in to view saved jobs');
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
                <h1 className={cx('title')}>Saved Jobs</h1>
                <p className={cx('subtitle')}>Jobs you've saved for later</p>
            </div>
            
            {savedJobs.length === 0 ? (
                <div className={cx('empty-state')} data-aos="fade-up">
                    <p>You haven't saved any jobs yet.</p>
                    <p>When you find a job you like, click the save icon to add it here.</p>
                </div>
            ) : (
                <div className={cx('jobs-grid')} data-aos="fade-up" data-aos-delay="200">
                    {savedJobs.map((savedJob, index) => (
                        <div 
                            key={savedJob.jobId}
                            data-aos="fade-up"
                            data-aos-delay={200 + (index % 9) * 100}
                        >
                            <JobCard job={savedJob} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default SavedJobs; 