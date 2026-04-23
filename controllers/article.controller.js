import Article from '../models/Article.js'
import User from '../models/User.js'

const calcReadTime = (text) => {//funzione per calcolare il tempo di lettura dell'articolo
    const wordsPerMinute = 200
    const words = text.split(' ').length
    return Math.ceil(words / wordsPerMinute)
}

export async function getAllArticles(req, res) {// risponde a GET /api/articles e prende tutti gli articoli dal database. 
    try {
        const { category } = req.query

        const filter = category ? { category } : {}

        const articles = await Article.find(filter)//Se nell'URL c'è ?category=stories filtra solo quelli di quella categoria. Usa .populate() per sostituire l'ID dell'autore con i suoi dati reali (nome, handle, avatar, badge).
            .populate('author', 'name handle avatar badge isRedazione')
            .sort({ createdAt: -1 })

        return res.status(200).json(articles)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function getFeaturedArticles(req, res) {//risponde a GET /api/articles/featured.
    try {
        const articles = await Article.find({ isFeatured: true })// Prende solo gli articoli dove isFeatured: true — quelli che appaiono nella sezione "Scelti da SexyTeller" in homepage. Massimo 4.
            .populate('author', 'name handle avatar badge isRedazione')
            .sort({ createdAt: -1 })
            .limit(4)

        return res.status(200).json(articles)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function getArticleById(req, res) {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'name handle avatar badge bio isRedazione')

        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' })
        }

        return res.status(200).json(article)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function createArticle(req, res) {//risponde a POST /api/articles. Crea un nuovo articolo.
    try {
        const { title, category, body, coverImage, videoUrl } = req.body //prendiamo i dati dal frontend

        const article = await Article.create({//creo l'articolo con tutit idati 
            title,
            category,
            body,
            coverImage,
            // videoUrl,
            author: req.user._id,
            isRedazione: req.user.isRedazione,
            readTime: calcReadTime(body)
        })

        const user = req.user // qui conto articoli ha pubblicato l'utente per capire lo status del suo badge : nuov, attivo, in evidenza 
        const articleCount = await Article.countDocuments({ author: user._id })
        if (articleCount >= 3 && user.badge === 'nuovo') {
            await User.findByIdAndUpdate(user._id, { badge: 'attivo' })
        }

        return res.status(201).json(article)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export async function updateArticle(req, res) {//risponde a PUT /api/articles/:id. Modifica un articolo esistente. Prima controlla che l'articolo esista, poi controlla che chi sta facendo la richiesta sia proprio l'autore dell'articolo — non puoi modificare l'articolo di qualcun altro. Aggiorna solo i campi che vengono inviati, non tocca quelli non modificati.
    try {
        const { title, category, body, coverImage, videoUrl } = req.body

        const article = await Article.findById(req.params.id)

        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' })
        }

        if (article.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Non autorizzato' })
        }

        if (title) article.title = title
        if (category) article.category = category
        if (body) {
            article.body = body
            article.readTime = calcReadTime(body)
        }
        if (coverImage) article.coverImage = coverImage
        if (videoUrl) article.videoUrl = videoUrl

        const updated = await article.save()

        return res.status(200).json(updated)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function deleteArticle(req, res) {//isponde a DELETE /api/articles/:id. Elimina un articolo. Come nell'update, prima controlla che esista e che chi lo vuole eliminare sia l'autore. Se tutto ok, lo cancella dal database.
    try {
        const article = await Article.findById(req.params.id)

        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' })
        }

        if (article.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Non autorizzato' })
        }

        await Article.findByIdAndDelete(req.params.id)

        return res.status(200).json({ message: 'Articolo eliminato' })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function searchArticles(req, res) {//isponde a GET /api/articles/search?search=parola. È la funzione di ricerca. Usa $regex di MongoDB che funziona come una ricerca testuale — cerca la parola in tre posti contemporaneamente: nel titolo, nella categoria e nel corpo dell'articolo.
    try {
        const page = parseInt(req.query.page) || 1. //la paginazione - non restituisce tutti gli articoli in una volta, ma 6 per volta. 
        const limit = 6
        const search = req.query.search || ""

        const query = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { body: { $regex: search, $options: "i" } }
            ]
        }

        const totalArticles = await Article.countDocuments(query)

        const articles = await Article.find(query)
            .populate('author', 'name handle avatar badge isRedazione')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        return res.status(200).json({//info che ci serviranno per fare bene la paginzione con il frontend
            currentPage: page,
            totalPages: Math.ceil(totalArticles / limit),
            totalArticles,
            articlesPerPage: limit,
            articles
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


export async function handleLike(req, res) {
    try {
        const article = await Article.findById(req.params.id)

        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' })
        }

        const userId = req.user._id
        const alreadyLiked = article.likes.includes(userId)

        if (alreadyLiked) {
            // se ha già messo like lo toglie
            article.likes = article.likes.filter(id => id.toString() !== userId.toString())
        } else {
            // se non ha ancora messo like lo aggiunge
            article.likes.push(userId)
        }

        await article.save()

        return res.status(200).json({
            likes: article.likes.length, // numero totale di like all'articolo
            liked: !alreadyLiked // true se ha appena messo like, false se lo ha tolto
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}