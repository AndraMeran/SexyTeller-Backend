import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {//è l'URL dell'articolo Lo genereremo automaticamente dal titolo
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        category: {
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
        author: {// non salviamo il nome dell'autore, ma il suo ID nel database. Con ref: 'User' diciamo a Mongoose che quell'ID si riferisce al modello User
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isRedazione: {
            type: Boolean,
            default: false
        },
        isFeatured: {//se è true appare nella sezione "Scelti da SexyTeller" in homepage
            type: Boolean,
            default: false
        },
        readTime: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

const Article = mongoose.model('Article', articleSchema)

export default Article