import { cloudName, uploadPreset, uploadUrl } from '../config/cloudinary.config';
import axios from 'axios';

const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(uploadUrl, formData);
        return response.data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image');
    }
};

export default uploadToCloudinary; 