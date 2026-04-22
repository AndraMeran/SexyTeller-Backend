import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const generateToken = (id, isRedazione) => {//si crea un token Jwt che ogni utente riceve al momento della reg o login
    return jwt.sign(//contiene 
        { id, isRedazione },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    )
}

export async function register(req, res) {
    try {
        const { name, handle, email, password, birthDate } = req.body

        const today = new Date()//funzione per controllare se maggiorene-  monthDiff serve per essere precisi —il semplice calcolo degli anni ti darebbe un anno in più. Se ha meno di 18 anni, blocca tutto e risponde con errore.
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }

        if (age < 18) {
            return res.status(400).json({ message: 'Devi avere almeno 18 anni per registrarti' })
        }

        const emailExists = await User.findOne({ email })//controllo se email esiste
        if (emailExists) {
            return res.status(400).json({ message: 'Email già registrata' })
        }

        const handleExists = await User.findOne({ handle })//controllo se handle esiste
        if (handleExists) {
            return res.status(400).json({ message: 'Handle già in uso' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)//hash della pasword

        const user = await User.create({//qui creiamo l'utente nel database
            name,
            birthDate,
            handle,
            email,
            password: hashedPassword
        })

        await resend.emails.send({//l'invio della email di benvenuto
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

        return res.status(201).json({//risposta al frontend con reg completata e generato token
            message: 'Registrazione completata',
            token: generateToken(user._id, user.isRedazione),
            isRedazione: user.isRedazione
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function login(req, res) {//ricerca l'utente per email
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: 'Credenziali errate' })//se non esiste credenziali errate
        }

        const result = await bcrypt.compare(password, user.password)//Confronta la password inserita con quella criptata nel database usando bcrypt.compare 
        if (!result) {
            return res.status(401).json({ message: 'Credenziali errate' })//se non coincidono 
        }

        return res.status(200).json({//se tutto ok risponde con il token 
            message: 'Login effettuato',
            token: generateToken(user._id, user.isRedazione),
            isRedazione: user.isRedazione
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export async function googleCallback(req, res) {//Questa funzione viene chiamata dopo che Google ha verificato l'identità dell'utente.
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