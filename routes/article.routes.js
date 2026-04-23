import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
    getAllArticles,
    getFeaturedArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    handleLike
} from '../controllers/article.controller.js'

const router = express.Router()

router.get('/', getAllArticles) // GET tutti gli articoli — pubblico
router.get('/featured', getFeaturedArticles) // GET articoli in evidenza — pubblico
router.get('/:id', getArticleById) // GET articolo singolo — pubblico
router.post('/', protect, createArticle) // POST crea articolo — privato
router.put('/:id', protect, updateArticle) // PUT modifica articolo — privato
router.delete('/:id', protect, deleteArticle) // DELETE elimina articolo — privato
router.post('/:id/like', protect, handleLike) // POST metti/togli like articolo — privato

export default router