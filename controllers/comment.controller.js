import Comment from '../models/Comment.js'
import Article from '../models/Article.js'

export async function getCommentsByArticle(req, res) {
    try {
        const comments = await Comment.find({ article: req.params.articleId })// cerca tutti i commenti i un articolo 
            .populate('author', 'name handle avatar badge') // sostituisce l'ID autore con i suoi dati
            .sort({ createdAt: -1 }) // ordinati dal più recente al più vecchio

        return res.status(200).json(comments)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function createComment(req, res) {
    try {
        const { body } = req.body

        const article = await Article.findById(req.params.articleId)//Prima controlla che l'articolo esista, poi crea il commento con il testo, l'ID dell'utente loggato e l'ID dell'articolo. 
        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' })
        }

        const comment = await Comment.create({
            body,
            author: req.user._id, // l'utente loggato è l'autore del commento
            article: req.params.articleId
        })

        const populated = await comment.populate('author', 'name handle avatar badge')

        return res.status(201).json(populated)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function deleteComment(req, res) {
    try {
        const comment = await Comment.findById(req.params.id)

        if (!comment) {
            return res.status(404).json({ message: 'Commento non trovato' })
        }

        // solo l'autore del commento o un membro della redazione può eliminarlo
        if (comment.author.toString() !== req.user._id.toString() && !req.user.isRedazione) {
            return res.status(401).json({ message: 'Non autorizzato' })
        }

        await Comment.findByIdAndDelete(req.params.id)

        return res.status(200).json({ message: 'Commento eliminato' })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function handleLike(req, res) {
    try {
        const comment = await Comment.findById(req.params.id)

        if (!comment) {
            return res.status(404).json({ message: 'Commento non trovato' })
        }

        const userId = req.user._id
        const alreadyLiked = comment.likes.includes(userId)

        if (alreadyLiked) {
            // se ha già messo like lo toglie
            comment.likes = comment.likes.filter(id => id.toString() !== userId.toString())
        } else {
            // se non ha ancora messo like lo aggiunge
            comment.likes.push(userId)
        }

        await comment.save()

        return res.status(200).json({
            likes: comment.likes.length, // numero totale di like al commento
            liked: !alreadyLiked // true se ha appena messo like, false se lo ha tolto
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}