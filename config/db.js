import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connesso al database MongoDB ')
    } catch (error) {
        console.error('Errore nella connessione al database:', error)
        process.exit(1)
    }
}

export default connectDB