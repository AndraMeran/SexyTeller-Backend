import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const generateToken = (id, isRedazione) => {
    return jwt.sign(
        { id, isRedazione },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )
}

export async function register(req, res) {
    try {
        const { name, handle, email, password } = req.body

        const emailExists = await User.findOne({ email })
        if (emailExists) {
            return res.status(400).json({ message: 'Email già registrata' })
        }

        const handleExists = await User.findOne({ handle })
        if (handleExists) {
            return res.status(400).json({ message: 'Handle già in uso' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            handle,
            email,
            password: hashedPassword
        })

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: user.email,
            subject: 'Benvenuto su SexyTeller',
            html: `<p>Ciao ${user.name},<br><br>
            Benvenuto su <strong>SexyTeller</strong>.<br><br>
            Qui non pubblichi semplicemente contenuti.<br>
            Dai voce a qualcosa.<br><br>
            Crea il tuo spazio. Racconta. Diventa SexyTeller.<br><br>
            A presto,<br>
            Il team di SexyTeller</p>`
        })

        return res.status(201).json({
            message: 'Registrazione completata',
            token: generateToken(user._id, user.isRedazione),
            isRedazione: user.isRedazione
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: 'Credenziali errate' })
        }

        const result = await bcrypt.compare(password, user.password)
        if (!result) {
            return res.status(401).json({ message: 'Credenziali errate' })
        }

        return res.status(200).json({
            message: 'Login effettuato',
            token: generateToken(user._id, user.isRedazione),
            isRedazione: user.isRedazione
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function googleCallback(req, res) {
    try {
        const user = req.user

        const token = generateToken(user._id, user.isRedazione)

        return res.redirect(
            `http://localhost:5173/login-success?token=${token}&isRedazione=${user.isRedazione}`
        )
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}