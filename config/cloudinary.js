import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'SexyTeller', // il nome della cartella uguale a come è stata creata su Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // formati permessi
        transformation: [{ width: 1200, crop: 'limit' }] // larghezza massima 1200px sono più che sufficienti per una copertina di articolo su web. Un'immagine da 4000px occupa molto più spazio su Cloudinary e impiega più tempo a caricarsi nel browser — inutilmente.
    }
})

const parser = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // limite massimo 5mb 
})

export default parser