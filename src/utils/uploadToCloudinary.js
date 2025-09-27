import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

export function uploadToCloudinary(imageSource, options = {}) {
  return new Promise((resolve, reject) => {
    if (/^https?:\/\//i.test(imageSource)) {
      cloudinary.uploader.upload(imageSource, options, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
      return
    }

    if (imageSource.startsWith('data:')) {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (err, result) => {
          if (err) return reject(err)
          resolve(result)
        }
      )

      const base64Data = imageSource.replace(/^data:.+;base64,/, '')
      streamifier
        .createReadStream(Buffer.from(base64Data, 'base64'))
        .pipe(uploadStream)
      return
    }

    cloudinary.uploader.upload(imageSource, options, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}
