import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        handle: {// nome utente pubblico tutto minuscolo, niente spazi, unico per ogni utente
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            default: null
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
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema)

export default User