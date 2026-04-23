import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
    getCommentsByArticle,
    createComment,
    deleteComment,
    handleLike
} from '../controllers/comment.controller.js'

const router = express.Router({ mergeParams: true })
// mergeParams: true permette di accedere a req.params.articleId
// che arriva dalla route padre in server.js

router.get('/', getCommentsByArticle) // GET commenti di un articolo — pubblico
router.post('/', protect, createComment) // POST crea commento — privato
router.delete('/:id', protect, deleteComment) // DELETE elimina commento — privato
router.post('/like', protect, handleLike) // POST metti/togli like — privato

export default router