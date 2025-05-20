const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinary');

/**
 * Generates a QR code based on booking ID and uploads it to Cloudinary
 * @param {string} bookingId - The ID of the booking
 * @returns {Promise<string>} - The secure URL of the uploaded QR code image
 */
const generateAndUploadQR = async (bookingId) => {
    try {
        // Generate the URL or content for the QR code (can be customized)
        const qrContent = `http://localhost:5173/bookings/${bookingId}`;

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(qrContent, {
            width: 300, // QR code size
            margin: 1  // QR code margin
        });

        // Extract base64 data from data URL
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
            `data:image/png;base64,${base64Data}`,
            {
                folder: 'qrcodes',
                public_id: `booking_${bookingId}`,
                overwrite: true,
                resource_type: 'image'
            }
        );

        // Return the secure URL of the uploaded image
        return uploadResult.secure_url;
    } catch (error) {
        console.error('Error generating or uploading QR code:', error);
        throw error;
    }
};

module.exports = {
    generateAndUploadQR
};