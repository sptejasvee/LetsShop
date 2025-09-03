/**
 * Extracts the public ID from a Cloudinary URL
 * @private
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Handle case where URL is already a public ID
  if (!url.startsWith('http')) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1 || uploadIndex >= pathParts.length - 1) {
      return null;
    }
    return pathParts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, '');
  } catch (e) {
    console.error('Error parsing Cloudinary URL:', e);
    return null;
  }
};

/**
 * Generates a proper Cloudinary URL
 * @param {string} image - The image URL or public ID
 * @param {Object} options - Transformation options
 * @returns {string} The formatted Cloudinary URL
 */
export const getCloudinaryUrl = (image, options = {}) => {
  if (!image) return '';
  
  // If it's already a URL, try to use it directly first
  if (typeof image === 'string' && image.startsWith('http')) {
    return image;
  }
  
  // Default options
  const {
    width = 800,
    height = 1000,
    quality = 'auto',
    crop = 'fill',
    format = 'auto'
  } = options;
  
  const publicId = getPublicIdFromUrl(image) || image;
  
  // If we still don't have a valid public ID, return a placeholder
  if (!publicId) {
    return 'https://via.placeholder.com/300x400?text=Product+Image';
  }
  
  // Construct the Cloudinary URL
  return `https://res.cloudinary.com/dcltwklbl/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};
