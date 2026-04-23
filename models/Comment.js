import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
    {
        body: {
            type: String,
            required: true, // il testo del commento
            trim: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // riferimento all'utente che ha scritto il commento
            required: true
        },
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article', // riferimento all'articolo a cui appartiene il commento
            required: true
        }
    },
    {
        timestamps: true // aggiunge automaticamente createdAt e updatedAt
    }
)

const Comment = mongoose.model('Comment', commentSchema)

export default Comment