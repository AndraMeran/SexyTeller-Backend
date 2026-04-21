import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function protect(req, res, next) {
    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({ message: 'Token mancante' })
    }

    const parts = token.split(' ')
    const jwtToken = parts[1]

    jwt.verify(jwtToken, process.env.JWT_SECRET, async function (error, payload) {

        if (error) {
            return res.status(401).json({ message: 'Token non valido o scaduto' })
        }

        const user = await User.findById(payload.id)

        if (!user) {
            return res.status(401).json({ message: 'Utente non autorizzato' })
        }

        req.user = user
        next()
    })
}