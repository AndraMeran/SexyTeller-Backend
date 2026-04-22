import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        birthDate: {
            type: Date,
            default: null
        },
        handle: {// nome utente pubblico tutto minuscolo, niente spazi, unico per ogni utente
            type: String,
            required: true,
            unique: true,//non possono esistere 2 utenti con lo stesso handle 
            trim: true,
            lowercase: true//salva sempre in minuscolo 
        },
        email: {
            type: String,
            required: true,//non possono esistere 2 utenti con la stesso email
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            default: null//può essere null perché chi usa Google non ha password
        },
        googleId: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            default: ''
        },
        avatar: {
            type: String,
            default: ''
        },
        cover: {
            type: String,
            default: ''
        },
        badge: {
            type: String,
            enum: ['nuovo', 'attivo', 'in_evidenza'],//il badge può essere solo uno di questi tre valori
            default: 'nuovo'
        },
        isRedazione: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true//aggiunge automaticamente createdAt e updatedAt
    }
)

const User = mongoose.model('User', userSchema)

export default User