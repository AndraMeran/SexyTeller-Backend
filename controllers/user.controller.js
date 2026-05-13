import User from '../models/User.js'
import Article from '../models/Article.js'
import Comment from '../models/Comment.js'
import jwt from 'jsonwebtoken'

// funzione locale per generare il token — stessa logica di auth.controller.js
const generateToken = (id, isRedazione, name, handle, avatar, cover) => {
    return jwt.sign(
        { id, isRedazione, name, handle, avatar, cover },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    )
}

export async function getUserByHandle(req, res) {
    try {
        const user = await User.findOne({ handle: req.params.handle })
            .select('-password -googleId')

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
        const user = await User.findOne({ handle: req.params.handle })

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' })
        }

        const articles = await Article.find({ author: user._id })
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
            { returnDocument: 'after', runValidators: true }
        ).select('-password -googleId')

        // genera un nuovo token con i dati aggiornati — inclusi avatar e cover
        const token = generateToken(
            updatedUser._id,
            updatedUser.isRedazione,
            updatedUser.name,
            updatedUser.handle,
            updatedUser.avatar,
            updatedUser.cover // ← aggiunto
        )

        return res.status(200).json({ user: updatedUser, token })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function deleteAccount(req, res) {
    try {
        await Article.deleteMany({ author: req.user._id })
        await Comment.deleteMany({ author: req.user._id })
        await User.findByIdAndDelete(req.user._id)

        return res.status(200).json({ message: 'Account eliminato con successo' })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function searchUsers(req, res) {
    try {
        const search = req.query.q || ""

        const users = await User.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { handle: { $regex: search, $options: "i" } },
                { bio: { $regex: search, $options: "i" } }
            ]
        })
            .select('-password -googleId')
            .limit(10)

        return res.status(200).json(users)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}