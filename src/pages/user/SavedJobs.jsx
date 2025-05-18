import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import JobCard from '../../components/JobList/JobCard';
import { ClipLoader } from 'react-spinners';
import styles from './SavedJobs.module.scss';
import classNames from 'classnames/bind';
import { FaBookmark } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const cx = classNames.bind(styles);

function SavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser, isAuthenticated } = useAuth();

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            delay: 100
        });
    }, []);

    // Refresh AOS when data changes
    useEffect(() => {
        if (!loading && savedJobs.length > 0) {
            AOS.refresh();
        }
    }, [loading, savedJobs]);

    useEffect(() => {
        const initializePage = async () => {
            try {
                if (!currentUser) {
                    setError('Please login to view saved jobs');
                    setLoading(false);
                    return;
                }

                await fetchSavedJobs();
            } catch (err) {
                console.error('Error initializing page:', err);
                setError('An error occurred while loading the page');
                setLoading(false);
            }
        };

        // Only run initialization if we have auth data
        if (currentUser) {
            initializePage();
        } else {
            setLoading(false);
            setError('Please login to view saved jobs');
        }
    }, [currentUser]);

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (!token || !currentUser) {
                setError('Please login to view saved jobs');
                setLoading(false);
                return;
            }

            // Ensure token is set in axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const response = await axios.get(`http://localhost:8080/api/saved-jobs/user/${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            console.log('Fetched saved jobs:', response.data);
            setSavedJobs(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            if (error.response?.status === 401) {
                setError('Your session has expired. Please login again.');
            } else {
                setError('Failed to load saved jobs. Please try again later.');
            }
            setSavedJobs([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <ClipLoader size={50} color="#20c6b1" loading={loading} />
            </div>
        );
    }

    if (error) {
        return <div className={cx('error-message')}>{error}</div>;
    }

    return (
        <section className={cx('container')}>
            <div className={cx('header')}>
                <h1 className={cx('title')} data-aos="fade-down">
                    <FaBookmark className={cx('icon')} />
                    Saved Jobs
                </h1>
                <p className={cx('subtitle')} data-aos="fade-up" data-aos-delay="100">
                    Jobs you've bookmarked for later
                </p>
            </div>
            
            <div className={cx('jobs-grid')}>
                {savedJobs && savedJobs.length > 0 ? (
                    savedJobs.map((job, index) => (
                        <div 
                            key={job.jobId}
                            data-aos="fade-up"
                            data-aos-delay={100 + index * 50}
                            data-aos-duration="800"
                        >
                            <JobCard job={job} onJobRemoved={fetchSavedJobs} />
                        </div>
                    ))
                ) : (
                    <div 
                        className={cx('no-jobs')}
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <FaBookmark className={cx('empty-icon')} />
                        <h2>No Saved Jobs</h2>
                        <p>Jobs you save will appear here</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default SavedJobs;