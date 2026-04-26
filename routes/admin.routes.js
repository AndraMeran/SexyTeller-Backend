import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/admin.middleware.js'
import {
    getAllUsers,
    blockUser,
    deleteUser,
    updateBadge,
    toggleFeatured,
    deleteArticle
} from '../controllers/admin.controller.js'

const router = express.Router()

// tutte le route admin sono protette da due middleware
// prima protect (sei loggato?) poi isAdmin (sei della redazione?)

router.get('/users', protect, isAdmin, getAllUsers) // GET lista utenti
router.put('/users/:id/block', protect, isAdmin, blockUser) // PUT blocca/sblocca utente
router.delete('/users/:id', protect, isAdmin, deleteUser) // DELETE elimina utente
router.put('/users/:id/badge', protect, isAdmin, updateBadge) // PUT assegna badge
router.put('/articles/:id/feature', protect, isAdmin, toggleFeatured) // PUT metti/togli in evidenza
router.delete('/articles/:id', protect, isAdmin, deleteArticle) // DELETE elimina articolo — solo redazione

export default router