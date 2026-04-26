import User from '../models/User.js'
import Article from '../models/Article.js'
import Comment from '../models/Comment.js'

export async function getAllUsers(req, res) {
    try {
        const users = await User.find()
            .select('-password -googleId') // non mandiamo mai password e googleId
            .sort({ createdAt: -1 }) // dal più recente al più vecchio

        return res.status(200).json(users)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function blockUser(req, res) {//FUNZIONE PER BLOCCARE E SBLOCCARE UTENTI  CON LA LOGICA TOGGLE(se è bloccato lo sblocchi, se sbloccato lo blocchi)
    try {
        const user = await User.findById(req.params.id)//controlla se l'utente esiste 

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' })
        }

        if (user.isRedazione) {//protezione per evitare di bloccare utente della redazione
            return res.status(400).json({ message: 'Non puoi bloccare un membro della redazione' })
        }

        // toggle — se è bloccato lo sblocca, se non lo è lo blocca
        user.isBlocked = !user.isBlocked
        await user.save()

        return res.status(200).json({
            message: user.isBlocked ? 'Utente bloccato' : 'Utente sbloccato',
            isBlocked: user.isBlocked
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' })
        }

        if (user.isRedazione) {//anche qui stessa cosa protezione per evitare di elimnare untente redazione
            return res.status(400).json({ message: 'Non puoi eliminare un membro della redazione' })
        }
        //attenzione all'ordine prima si 
        // elimina tutti gli articoli dell'utente
        await Article.deleteMany({ author: user._id })

        // elimina tutti i commenti dell'utente
        await Comment.deleteMany({ author: user._id })

        // elimina l'utente
        await User.findByIdAndDelete(req.params.id)

        return res.status(200).json({ message: 'Utente e tutti i suoi contenuti eliminati' })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function updateBadge(req, res) {
    try {
        const { badge } = req.body

        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' })
        }

        // controlla che il badge può essere solo uno di questi tre valori
        if (!['nuovo', 'attivo', 'in_evidenza'].includes(badge)) {
            return res.status(400).json({ message: 'Badge non valido' })
        }

        user.badge = badge
        await user.save()

        return res.status(200).json({
            message: 'Badge aggiornato',
            badge: user.badge
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function toggleFeatured(req, res) {//metti o togli un articolo in eveideza nella homepage con il metodo toggle
    try {
        const article = await Article.findById(req.params.id)

        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' })
        }

        // toggle — se è in evidenza lo toglie, se non lo è lo mette
        article.isFeatured = !article.isFeatured
        await article.save()

        return res.status(200).json({
            message: article.isFeatured ? 'Articolo messo in evidenza' : 'Articolo tolto dall evidenza',
            isFeatured: article.isFeatured
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export async function deleteArticle(req, res) {//funzione per eliminare il singolo articolo di un utente
    try {
        const article = await Article.findById(req.params.id)

        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' })
        }

        await Article.findByIdAndDelete(req.params.id)

        return res.status(200).json({ message: 'Articolo eliminato dalla redazione' })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}