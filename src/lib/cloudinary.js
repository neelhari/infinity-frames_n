const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'infinity_frames';

if (!CLOUD_NAME) {
  console.error(
    'Cloudinary is not configured: set VITE_CLOUDINARY_CLOUD_NAME in .env. Image/video uploads will fail until this is fixed.'
  );
}

/**
 * Returns optimized Cloudinary URL for media asset
 */
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
 * Uploads an image/video file to Cloudinary via an unsigned upload preset.
 * Always returns { success, url?, message? } — callers must check `success`
 * and must NOT fall back to a local blob: URL, since that only exists in the
 * current browser tab and will render broken for every other visitor and
 * after refresh.
 */
export async function uploadToCloudinary(file) {
  if (!CLOUD_NAME) {
    return { success: false, message: 'Cloudinary is not configured (missing VITE_CLOUDINARY_CLOUD_NAME).' };
  }

  const formData = new FormData();
  formData.append('file', file);
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
    // For images:
    // - f_auto: automatic modern format delivery (WebP / AVIF) based on browser support
    // - q_auto: smart perceptual compression (reduces 5-10MB mobile uploads to ~100-200KB with zero visible loss)
    // - w_1200,c_limit: caps image width to 1200px max, never upscales smaller images
    if (resourceType === 'image' && finalUrl && finalUrl.includes('/image/upload/')) {
      finalUrl = finalUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1200,c_limit/');
    }
    // For videos:
    // - q_auto: automatic optimal compression bitrate
    // - vc_auto: modern web video codec (H.264 / VP9 / AV1)
    // - w_720: limit resolution to 720p HD to cut video size by 70-85%
    if (resourceType === 'video' && finalUrl && finalUrl.includes('/video/upload/')) {
      finalUrl = finalUrl.replace('/video/upload/', '/video/upload/q_auto,vc_auto,w_720/');
    }

    return { success: true, url: finalUrl, publicId: data.public_id, raw: data };
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return { success: false, message: err.message || 'Network error while uploading to Cloudinary.' };
  }
}
