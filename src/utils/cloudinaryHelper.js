export const uploadImageFromUrl = async (url) => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'products',
      overwrite: false,
      invalidate: true
    })
    return result.secure_url
  } catch (err) {
    console.error('Cloudinary upload failed:', err.message || err)
    return process.env.DEFAULT_IMAGE_URL || '/default.jpg'
  }
}

export const extractPublicId = (url) => {
  if (!url || url === '/default.jpg') return null
  try {
    return cloudinary.utils.public_id(url)
  } catch {
    return null
  }
}
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log('Deleted from Cloudinary:', result)
    return result
  } catch (err) {
    console.error('Error deleting image:', err)
    throw err
  }
}
