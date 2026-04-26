export async function isAdmin(req, res, next) {
    // questo middleware va sempre dopo protect
    // quindi req.user esiste già
    if (!req.user.isRedazione) {
        return res.status(403).json({//ERRORE 403 CHE STA PER VIETATO
            message: 'Accesso negato — area riservata alla redazione'
        })
    }
    next()
}