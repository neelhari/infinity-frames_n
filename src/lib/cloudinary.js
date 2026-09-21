const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'infinity_frames';

if (!CLOUD_NAME) {
  console.error(
    'Cloudinary is not configured: set VITE_CLOUDINARY_CLOUD_NAME in .env. Image/video uploads will fail until this is fixed.'
  );
}

/**
 * Client-side fast image compression using HTML5 Canvas.
 * Automatically downscales 10-20MB mobile camera photos to ~250-400KB in milliseconds
 * BEFORE sending across the network.
 */
export async function compressImageFile(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = {}) {
  // Only compress raster images. Skip small files (< 300KB), GIFs, and SVGs
  if (
    !file ||
    !file.type ||
    !file.type.startsWith('image/') ||
    file.type === 'image/gif' ||
    file.type === 'image/svg+xml' ||
    file.size < 300 * 1024
  ) {
    return file;
  }

  // Ensure browser environment with Canvas support
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Proportional resize if larger than maxWidth/maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-efficiency JPEG blob
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed size isn't smaller, keep original file
              resolve(file);
            } else {
              const cleanName = file.name.replace(/\.[^/.]+$/, '.jpg');
              const compressed = new File([blob], cleanName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressed);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Returns optimized Cloudinary URL for media asset.
 * If given an existing Cloudinary URL without compression, injects f_auto,q_auto.
 */
export function buildCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return '';
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    if (publicId.includes('res.cloudinary.com') && publicId.includes('/image/upload/') && !publicId.includes('f_auto')) {
      return publicId.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1200,c_limit/');
    }
    return publicId;
  }
  if (publicId.startsWith('/')) {
    return publicId;
  }
  const width = options.width ? `w_${options.width}` : 'w_1200';
  const height = options.height ? `h_${options.height}` : '';
  const crop = options.crop ? `c_${options.crop}` : 'c_limit';
  const quality = options.quality ? `q_${options.quality}` : 'q_auto';
  const format = options.format ? `f_${options.format}` : 'f_auto';

  const transformations = [crop, width, height, quality, format].filter(Boolean).join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

/**
 * Returns an optimized image URL for any image source.
 * Injects f_auto,q_auto for Cloudinary URLs, or returns the URL directly.
 */
export function getOptimizedImageUrl(url, { width = 800, quality = 'auto' } = {}) {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    if (url.includes('f_auto') || url.includes('q_auto')) return url;
    return url.replace('/image/upload/', `/image/upload/f_auto,q_${quality},w_${width},c_limit/`);
  }
  return url;
}

/**
 * Uploads an image/video file to Cloudinary with automatic client-side compression.
 */
export async function uploadToCloudinary(file) {
  if (!CLOUD_NAME) {
    return { success: false, message: 'Cloudinary is not configured (missing VITE_CLOUDINARY_CLOUD_NAME).' };
  }

  // 1. Client-side compression before sending over network
  let fileToUpload = file;
  if (file.type && file.type.startsWith('image/')) {
    try {
      fileToUpload = await compressImageFile(file);
    } catch (err) {
      console.warn('Client-side compression skipped:', err);
      fileToUpload = file;
    }
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', UPLOAD_PRESET);

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      const message = data?.error?.message || `Upload failed with status ${res.status}`;
      console.error('Cloudinary upload error:', message);
      return { success: false, message };
    }
    let finalUrl = data.secure_url;
    // Automatic Cloudinary compression & web optimization:
    // - f_auto: automatic modern format delivery (WebP / AVIF) based on browser support
    // - q_auto: smart perceptual compression
    // - w_1200,c_limit: caps image width to 1200px max
    if (resourceType === 'image' && finalUrl && finalUrl.includes('/image/upload/')) {
      finalUrl = finalUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1200,c_limit/');
    }
    if (resourceType === 'video' && finalUrl && finalUrl.includes('/video/upload/')) {
      finalUrl = finalUrl.replace('/video/upload/', '/video/upload/q_auto,vc_auto,w_720/');
    }

    return { success: true, url: finalUrl, publicId: data.public_id, raw: data };
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return { success: false, message: err.message || 'Network error while uploading to Cloudinary.' };
  }
}
