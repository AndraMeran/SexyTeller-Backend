import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import parser from '../config/cloudinary.js'

const router = express.Router()

// POST /api/upload — carica immagine su Cloudinary
// solo gli utenti loggati possono caricare immagini
router.post('/', protect, parser.single('image'), (req, res) => {//importamte .single('image') significa "accetta un solo file con il campo chiamato image
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nessuna immagine caricata' })
        }

        // cloudinary restituisce l'URL dell'immagine in req.file.path
        return res.status(200).json({
            url: req.file.path,
            message: 'Immagine caricata con successo'
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

export default router