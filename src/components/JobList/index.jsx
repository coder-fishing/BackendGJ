import { useState, useEffect } from 'react';
import classNames from "classnames/bind";
import styles from "./JobList.module.scss";
import JobCard from './JobCard';
import axios from 'axios';
import { ClipLoader } from "react-spinners";
import { useAuth } from '../../utils/AuthContext';
import { FaSearch } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

function JobList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const { currentUser, isAuthenticated } = useAuth();
    const location = useLocation();

    // Extract search query from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            setSearchQuery(searchParam);
            setPage(0);
            fetchJobs(0, searchParam);
        }
    }, [location.search]);

    const fetchJobs = async (pageNumber, keyword = '') => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (!token) {
                console.log('No token found');
                setError('Authentication required');
                setLoading(false);
                return;
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            const endpoint = keyword 
                ? `http://localhost:8080/api/jobs/search?keyword=${encodeURIComponent(keyword)}&page=${pageNumber}&size=9`
                : `http://localhost:8080/api/jobs/approved?page=${pageNumber}&size=9`;

            const response = await axios.get(endpoint);
            const newJobs = response.data.content || [];
            
            if (pageNumber === 0) {
                setJobs(newJobs);
            } else {
                setJobs(prevJobs => [...prevJobs, ...newJobs]);
            }
            
            setHasMore(!response.data.last);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load jobs. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated()) {
            fetchJobs(0, searchQuery);
        } else {
            setLoading(false);
            setError('Please log in to view jobs');
        }
    }, [isAuthenticated, currentUser]);

    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        // Clear the existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set a new timeout to delay the search
        const timeoutId = setTimeout(() => {
            setPage(0); // Reset to first page
            fetchJobs(0, query);
        }, 500); // Delay of 500ms

        setSearchTimeout(timeoutId);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => {
                const nextPage = prevPage + 1;
                fetchJobs(nextPage, searchQuery);
                return nextPage;
            });
        }
    };

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                }
            },
            { threshold: 0.5 }
        );

        const sentinel = document.querySelector('#sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, searchQuery]);

    if (loading && page === 0) {
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
                <h1 className={cx('title')}>Available Jobs</h1>
                <p className={cx('subtitle')}>Find your next opportunity</p>
                <div className={cx('search-container')}>
                    <div className={cx('search-box')}>
                        <FaSearch className={cx('search-icon')} />
                        <input
                            type="text"
                            placeholder="Search for jobs..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className={cx('search-input')}
                        />
                    </div>
                </div>
            </div>
            
            <div className={cx('jobs-grid')} data-aos="fade-up" data-aos-delay="200">
                {jobs.map((job, index) => (
                    <div 
                        key={job.jobId}
                        data-aos="fade-up"
                        data-aos-delay={200 + (index % 9) * 100}
                    >
                        <JobCard job={job} />
                    </div>
                ))}
            </div>

            {/* Loading sentinel for infinite scroll */}
            {hasMore && (
                <div id="sentinel" className={cx('loading-more')}>
                    <ClipLoader size={30} color="#007bff" loading={loading} />
                </div>
            )}

            {jobs.length === 0 && !loading && (
                <div className={cx('no-results')}>
                    <p>No jobs found matching your search criteria.</p>
                </div>
            )}
        </section>
    );
}

export default JobList; 