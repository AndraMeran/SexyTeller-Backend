import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import passport from 'passport'
import connectDB from './config/db.js'
import googleStrategy from './config/googleStrategy.js'
import authRoutes from './routes/auth.routes.js'
import articleRoutes from './routes/article.routes.js'
import commentRoutes from './routes/comment.routes.js'
import userRoutes from './routes/user.routes.js'
import adminRoutes from './routes/admin.routes.js'
import uploadRoutes from './routes/upload.routes.js'

dotenv.config()

connectDB()

passport.use(googleStrategy)

const app = express()

app.use(cors())
app.use(express.json())
app.use(passport.initialize())

app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/articles/:articleId/comments', commentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)

app.get('/', (req, res) => {
    res.json({ message: 'SexyTeller API is running' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`)
})