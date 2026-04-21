import express from 'express'
import passport from 'passport'
import { register, login, googleCallback } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleCallback
)

export default router