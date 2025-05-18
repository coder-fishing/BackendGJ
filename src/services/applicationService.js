import axios from 'axios';
import uploadImage from '~/utils/uploadImage';

const API_URL = 'http://localhost:8080/api';

class ApplicationService {
    async applyForJob(jobId, applicantId, coverLetter, resumeFile) {
        try {
            // First upload the resume to cloud storage
            const resumeUrl = await uploadImage(resumeFile);

            // Then submit the application
            const response = await axios.post(`${API_URL}/applications`, {
                jobId,
                applicantId,
                coverLetter,
                resumeUrl
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken')}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error applying for job:', error);
            throw error;
        }
    }

    async getApplicationsByApplicant(applicantId) {
        try {
            const response = await axios.get(`${API_URL}/applications/applicant/${applicantId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    }

    async getApplicationsByJob(jobId) {
        try {
            const response = await axios.get(`${API_URL}/applications/job/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching job applications:', error);
            throw error;
        }
    }
}

export default new ApplicationService(); 