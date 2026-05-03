import User from '../models/User.js'
import Article from '../models/Article.js'
import Comment from '../models/Comment.js'
import jwt from 'jsonwebtoken'

// funzione locale per generare il token — stessa logica di auth.controller.js
const generateToken = (id, isRedazione, name, handle) => {
    return jwt.sign(
        { id, isRedazione, name, handle },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    )
}

export async function getUserByHandle(req, res) {
    try {
        const user = await User.findOne({ handle: req.params.handle })//cerchamo l'utente per handle
            .select('-password -googleId') // non mandiamo mai la password e il googleId

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' })
        }

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function getUserArticles(req, res) {
    try {
        const user = await User.findOne({ handle: req.params.handle })//anche qui prima cerca l'utente sempre per handle

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' })
        }

        const articles = await Article.find({ author: user._id })//cerca tutti gli articoli corrispondenti al Id dell'utente
            .populate('author', 'name handle avatar badge isRedazione')
            .sort({ createdAt: -1 })

        return res.status(200).json(articles)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function updateProfile(req, res) {
    try {
        const { name, bio, avatar, cover } = req.body

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, bio, avatar, cover },
            { new: true, runValidators: true }
        ).select('-password -googleId')

        // genera un nuovo token con i dati aggiornati
        const token = generateToken(
            updatedUser._id,
            updatedUser.isRedazione,
            updatedUser.name,
            updatedUser.handle
        )

        return res.status(200).json({ user: updatedUser, token })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


export async function deleteAccount(req, res) {//funzione per eliminare attenzione all'ordine---se eliminassimo prima l'utente rimarrebbero articoli e commenti "orfani" nel database senza autore.
    try {
        // elimina tutti gli articoli dell'utente
        await Article.deleteMany({ author: req.user._id })

        // elimina tutti i commenti dell'utente
        await Comment.deleteMany({ author: req.user._id })

        // elimina l'utente
        await User.findByIdAndDelete(req.user._id)

        return res.status(200).json({ message: 'Account eliminato con successo' })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}