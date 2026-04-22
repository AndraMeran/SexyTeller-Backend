import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()//carichiamo le variabili d'ambiente dal file .env

const googleStrategy = new GoogleStrategy(//con queata configuazione diciamo a Passport come identificarsi con google
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {//cn questa funzione - la logica viene eseguita solo dopo che google ha verificato l'utente
        try {
            const email = profile.emails?.[0]?.value //prende l'email dal profilo google

            if (!email) {
                return done(new Error("Email Google non disponibile"), null) //Se Google non trova l'email -  passiamo un errore a done.
            }

            let user = await User.findOne({ email }) //cerchiamo l'utente nel database con l'email

            if (!user) {//se l'utente non esiste viene creato con idati che Google ci ha fornito
                user = new User({
                    name: profile.displayName || "",
                    handle: profile.emails?.[0]?.value.split('@')[0],
                    email,
                    avatar: profile.photos?.[0]?.value || "",
                    password: null,
                    googleId: profile.id,
                    isRedazione: false
                })

                await user.save() //salviamo il nuovo utente nel database
            }

            return done(null, user)
        } catch (error) {
            return done(error, null)
        }
    }
)

export default googleStrategy