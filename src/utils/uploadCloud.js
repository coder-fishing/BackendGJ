import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = 'dqf2xhz2e';
const CLOUDINARY_UPLOAD_PRESET = 'goodjob';

const uploadCloud = async (file) => {
    if (!file) {
        throw new Error('No file provided');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                // Remove any default authorization headers for Cloudinary requests
                transformRequest: [(data, headers) => {
                    delete headers.Authorization;
                    return data;
                }]
            }
        );

        if (response.data && response.data.secure_url) {
            return response.data.secure_url;
        } else {
            throw new Error('Invalid response from cloud storage');
        }
    } catch (error) {
        console.error('Error uploading file to cloud:', error);
        throw new Error(error.response?.data?.message || 'Failed to upload file to cloud storage');
    }
};

export default uploadCloud; 