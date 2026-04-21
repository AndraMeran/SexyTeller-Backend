import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import passport from 'passport'
import connectDB from './config/db.js'
import googleStrategy from './config/passport.js'
import authRoutes from './routes/auth.routes.js'

dotenv.config()

connectDB()

passport.use(googleStrategy)

const app = express()

app.use(cors())
app.use(express.json())
app.use(passport.initialize())

app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
    res.json({ message: 'SexyTeller API is running' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`)
})