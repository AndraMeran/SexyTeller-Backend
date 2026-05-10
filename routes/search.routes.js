import express from 'express'
import Article from '../models/Article.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const search = req.query.q || ""

        if (!search.trim()) {
            return res.status(400).json({ message: 'Inserisci un termine di ricerca' })
        }

        if (search.trim().length < 2) {
            return res.status(400).json({ message: 'Il termine di ricerca deve avere almeno 2 caratteri' })
        }

        const query = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { body: { $regex: search, $options: "i" } }
            ]
        }

        const [articles, users] = await Promise.all([
            Article.find(query)
                .populate('author', 'name handle avatar badge isRedazione')
                .sort({ createdAt: -1 })
                .limit(20),
            User.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { handle: { $regex: search, $options: "i" } },
                    { bio: { $regex: search, $options: "i" } }
                ]
            })
                .select('-password -googleId')
                .limit(10)
        ])

        return res.status(200).json({
            query: search,
            totalArticles: articles.length,
            totalUsers: users.length,
            articles,
            users
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

export default router