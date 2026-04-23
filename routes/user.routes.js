import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
    getUserByHandle,
    getUserArticles,
    updateProfile,
    deleteAccount
} from '../controllers/user.controller.js'

const router = express.Router()

router.get('/:handle', getUserByHandle) // GET profilo pubblico — tutti
router.get('/:handle/articles', getUserArticles) // GET articoli utente — tutti
router.put('/me', protect, updateProfile) // PUT modifica profilo — solo loggati
router.delete('/me', protect, deleteAccount) // DELETE elimina account — solo loggati

export default router