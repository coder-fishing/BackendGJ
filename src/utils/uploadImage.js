import { cloudName, uploadPreset } from '../config/cloudinary.config';
import axios from 'axios';

const uploadToCloudinary = async (file) => {
    if (!file) {
        throw new Error('No file provided');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        // For CV files, we'll use the auto endpoint which will automatically detect the file type
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
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
        console.error('Error uploading to Cloudinary:', error.response?.data || error);
        throw new Error(error.response?.data?.error?.message || 'Failed to upload file');
    }
};

export default uploadToCloudinary; 