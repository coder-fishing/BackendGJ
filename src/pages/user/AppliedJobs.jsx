import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import JobCard from '../../components/JobList/JobCard';
import { ClipLoader } from 'react-spinners';
import styles from './AppliedJobs.module.scss';
import classNames from 'classnames/bind';
import { FaHistory } from 'react-icons/fa';

const cx = classNames.bind(styles);

function AppliedJobs() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchApplications();
    }, [currentUser]);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (!token || !currentUser) {
                setError('Please login to view your applications');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/applications/applicant/${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response:', response.data); // Debug log

            // Transform the job data to match JobCard expectations with safety checks
            const transformedApplications = response.data.map(application => {
                if (!application) {
                    console.warn('Received null or undefined application');
                    return null;
                }

                // Debug log for each application
                console.log('Processing application:', application);

                // If job is missing, return null to filter it out
                if (!application.jobId) {
                    console.warn('Application missing jobId:', application);
                    return null;
                }

                // Create a current date for default values
                const now = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(now.getDate() + 30);

                return {
                    ...application,
                    job: {
                        jobId: application.jobId,
                        title: application.jobTitle || 'Untitled Position',
                        employerId: application.employerId,
                        employerName: application.employerName || 'Unknown Company',
                        location: application.location || 'Location not specified',
                        companyLogo: application.companyLogo || '/default-company-logo.png',
                        imageUrl: application.imageUrl,
                        description: application.description || '',
                        requirement: application.requirement || '',
                        jobType: application.jobType || 'FULL_TIME',
                        salaryMin: application.salaryMin || 0,
                        salaryMax: application.salaryMax || 0,
                        salaryCurrency: application.salaryCurrency || 'VND',
                        // Use application date as postedAt if not provided
                        postedAt: application.postedAt || application.applicationDate || now.toISOString(),
                        // Default expireAt to 30 days from now if not provided
                        expireAt: application.expireAt || thirtyDaysFromNow.toISOString(),
                        viewCount: application.viewCount || 0,
                        applyCount: application.applyCount || 0,
                        // Add employer's image URL if available
                        employerImageUrl: application.imageUrl
                    }
                };
            }).filter(Boolean); // Remove any null entries

            setApplications(transformedApplications);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError('Failed to load applications. Please try again later.');
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'accepted':
                return 'status-accepted';
            case 'rejected':
                return 'status-rejected';
            default:
                return 'status-pending';
        }
    };

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
                <h1 className={cx('title')}>
                    <FaHistory className={cx('icon')} />
                    Applied Jobs
                </h1>
                <p className={cx('subtitle')}>Track your job applications</p>
            </div>
            
            <div className={cx('applications-grid')} data-aos="fade-up" data-aos-delay="200">
                {applications.length > 0 ? (
                    applications.map((application, index) => (
                        <div 
                            key={application.id}
                            className={cx('application-card')}
                            data-aos="fade-up"
                            data-aos-delay={200 + index * 100}
                        >
                            <JobCard job={application.job} />
                            <div className={cx('application-details')}>
                                <div className={cx('application-info')}>
                                    <p className={cx('applied-date')}>
                                        Applied: {new Date(application.applicationDate).toLocaleDateString()}
                                    </p>
                                    <div className={cx('status', getStatusBadgeClass(application.status))}>
                                        {application.status || 'Pending'}
                                    </div>
                                </div>
                                {application.coverLetter && (
                                    <div className={cx('cover-letter')}>
                                        <h3>Cover Letter</h3>
                                        <p>{application.coverLetter}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={cx('no-applications')}>
                        <FaHistory className={cx('empty-icon')} />
                        <h2>No Applications Yet</h2>
                        <p>Start applying for jobs to see your applications here</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AppliedJobs; 