import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value

            if (!email) {
                return done(new Error("Email Google non disponibile"), null)
            }

            let user = await User.findOne({ email })

            if (!user) {
                user = new User({
                    name: profile.displayName || "",
                    handle: profile.emails?.[0]?.value.split('@')[0],
                    email,
                    avatar: profile.photos?.[0]?.value || "",
                    password: null,
                    googleId: profile.id,
                    isRedazione: false
                })

                await user.save()
            }

            return done(null, user)
        } catch (error) {
            return done(error, null)
        }
    }
)

export default googleStrategy