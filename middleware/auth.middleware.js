import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function protect(req, res, next) {//controlliamo se nella richiesta c'è un token JWT
    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({ message: 'Token mancante' })//se non c'è blocca tutto
    }

    const parts = token.split(' ')
    const jwtToken = parts[1]

    jwt.verify(jwtToken, process.env.JWT_SECRET, async function (error, payload) {//se il token c'è lo controlla 

        if (error) {
            return res.status(401).json({ message: 'Token non valido o scaduto' })
        }

        const user = await User.findById(payload.id)//trova l'utente 

        if (!user) {
            return res.status(401).json({ message: 'Utente non autorizzato' })
        }

        req.user = user
        next()
    })
}