import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        subtitle: { // sottotitolo opzionale — appare sotto il titolo nell'articolo
            type: String,
            default: '',
            trim: true
        },
        category: {//può essere solo una di queste 6 vategorie 
            type: String,
            required: true,
            enum: ['stories', 'decode', 'crossover', 'trends', 'darkside', 'voices']
        },
        body: {
            type: String,
            required: true
        },
        coverImage: {
            type: String,
            default: ''
        },
        // videoUrl: {
        //     type: String,
        //     default: ''
        // },
        author: {// non salviamo il nome dell'autore, ma il suo ID nel database.
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', //diciamo a Mongoose che quell'ID si riferisce al modello User
            required: true
        },
        isRedazione: { // true = articolo scritto dalla redazione, false = articolo di un utente
            type: Boolean,
            default: false
        },
        isFeatured: {//se è true appare nella sezione "Scelti da SexyTeller" in homepage
            type: Boolean,
            default: false
        },
        readTime: {//minuti di lettura, lo calcoleremo automaticamente
            type: Number,
            default: 0
        },
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User', // array di ID utenti che hanno messo like
            default: [] // di default nessun like
        },
        isSensitive: { // true = contiene elementi sensibili, visibile solo agli utenti loggati e maggiorenni
            type: Boolean,
            default: false
        },
        contentTag: {  // tag che descrive il tipo di contenuto — aiuta a orientare la pubblicazione
            type: String,
            enum: ['educativo', 'narrativo', 'opinione', ''],
            default: ''
        }
    },
    {
        timestamps: true//aggiunge automaticamente createdAt e updatedAt
    }
)

const Article = mongoose.model('Article', articleSchema)

export default Article