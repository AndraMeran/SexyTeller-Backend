# SexyTeller — Backend

 > **Repository Frontend:**  https://github.com/AndraMeran/SexyTeller-Frontend
 > **Link Render:** https://sexyteller-backend.onrender.com

## Descrizione

SexyTeller è una piattaforma social editoriale contemporanea che esplora sessualità, erotismo e pornografia trattati con un approccio serio, narrativo e moderno, attraverso narrazione, analisi e cultura pop. 
Il progetto unisce la struttura di un magazine digitale all’interazione di un social, creando uno spazio dove gli utenti non pubblicano semplicemente contenuti, ma vengono guidati nel modo in cui raccontarli.  

SexyTeller non divide i contenuti per argomento, ma per approccio editoriale e stile narrativo: raccontare, analizzare, collegare, approfondire o dare voce a esperienze e punti di vista diversi.  

L’obiettivo è costruire un ecosistema capace di trasformare temi spesso trattati superficialmente in contenuti con identità, profondità e valore narrativo e culturale.

I contenuti sono organizzati in 6 categorie basate sul modo di raccontare — non sull'argomento:

| Categoria | Descrizione |
|-----------|-------------|
| **Stories** | Racconti narrativi — biografie, ascese, cadute |
| **Decode** | Spiegazioni e analisi — psicologia, fenomeni |
| **Crossover** | Connessioni con cinema, moda, arte, musica |
| **Trends** | Attualità e notizie del settore |
| **Dark Side** | Temi scomodi e reali — dipendenze, crime |
| **Voices** | Interviste e testimonianze dirette |



## Stack MERN

- **Runtime:** Node.js con ES Modules (import/export)
- **Framework:** Express.js
- **Database:** MongoDB con Mongoose
- **Autenticazione:** JWT + Bcrypt + Google OAuth (Passport.js)
- **Email:** Resend
- **Upload immagini:** Cloudinary + Multer
- **Deploy:** Render



## Struttura Cartelle

```
sexyteller-backend/
├── config/
│   ├── db.js                 # Connessione MongoDB Atlas
│   ├── cloudinary.js         # Configurazione Cloudinary + Multer
│   └── googleStrategy.js     # Strategia Google OAuth Passport.js
├── controllers/
│   ├── auth.controller.js    # Register, Login, Google OAuth
│   ├── article.controller.js # CRUD articoli + like
│   ├── comment.controller.js # CRUD commenti + like
│   ├── user.controller.js    # Profilo utente
│   └── admin.controller.js   # Pannello amministrazione
├── middleware/
│   ├── auth.middleware.js    # protect — verifica token JWT
│   └── admin.middleware.js   # isAdmin — verifica isRedazione
├── models/
│   ├── User.js               # Schema utente
│   ├── Article.js            # Schema articolo
│   └── Comment.js            # Schema commento
├── routes/
│   ├── auth.routes.js        # /api/auth
│   ├── article.routes.js     # /api/articles
│   ├── comment.routes.js     # /api/articles/:id/comments
│   ├── user.routes.js        # /api/users
│   ├── admin.routes.js       # /api/admin
│   ├── search.routes.js      # /api/search
│   └── upload.routes.js      # /api/upload
├── server.js                 # Entry point
├── .env.example              # Template variabili d'ambiente
├── .gitignore
└── package.json
```


## Installazione e Avvio

### 1. Clona il repository

```bash
git clone https://github.com/AndraMeran/SexyTeller-Backend
cd sexyteller-backend
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura le variabili d'ambiente

Crea un file `.env` nella root del progetto copiando `.env.example`:

```bash
cp .env.example .env
```

Compila le variabili nel file `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=il_tuo_jwt_secret
RESEND_API_KEY=la_tua_api_key_resend
GOOGLE_CLIENT_ID=il_tuo_google_client_id
GOOGLE_CLIENT_SECRET=il_tuo_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLOUDINARY_CLOUD_NAME=il_tuo_cloud_name
CLOUDINARY_API_KEY=la_tua_api_key
CLOUDINARY_API_SECRET=il_tuo_api_secret
```

### 4. Avvia il server

```bash
# Sviluppo (con nodemon)
npm run dev

# Produzione
npm start
```

Il server sarà disponibile su `http://localhost:5000`


## Modelli Database

### User
| Campo | Tipo | Note |
|-------|------|------|
| name | String | required |
| birthDate | Date | Usata per verificare 18+ |
| handle | String | unique, lowercase — NON modificabile |
| email | String | unique, lowercase |
| password | String | Criptata con bcrypt — null per utenti Google |
| googleId | String | ID Google OAuth |
| bio | String | Linea editoriale del SexyTeller |
| avatar | String | URL Cloudinary |
| cover | String | URL Cloudinary |
| badge | String | nuovo / attivo / in_evidenza |
| isRedazione | Boolean | true = accesso admin |
| isBlocked | Boolean | true = bloccato dalla redazione |

### Article
| Campo | Tipo | Note |
|-------|------|------|
| title | String | required |
| subtitle | String | Sottotitolo opzionale — appare sotto il titolo |
| category | String | stories/decode/crossover/trends/darkside/voices |
| body | String | Testo + immagini embedded |
| coverImage | String | URL Cloudinary |
| videoUrl | String | URL YouTube/Vimeo |
| author | ObjectId | ref: User |
| isRedazione | Boolean | Ereditato dall'autore |
| isFeatured | Boolean | Scelti da SexyTeller in homepage |
| isSensitive | Boolean | Mostra schermata 18+ se non loggato |
| contentTag | String | educativo/narrativo/opinione |
| readTime | Number | Calcolato automaticamente |
| likes | [ObjectId] | Array ID utenti |

### Comment
| Campo | Tipo | Note |
|-------|------|------|
| body | String | required |
| author | ObjectId | ref: User |
| article | ObjectId | ref: Article |
| likes | [ObjectId] | Array ID utenti |


## API Routes

### Autenticazione — `/api/auth`
| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrazione — controlla età 18+, invia email | No |
| POST | `/api/auth/login` | Login — restituisce token JWT 24h | No |
| GET | `/api/auth/google` | Avvia Google OAuth | No |
| GET | `/api/auth/google/callback` | Callback Google OAuth | No |

### Articoli — `/api/articles`
| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| GET | `/api/articles` | Tutti gli articoli — filtri: `?category=` `?isRedazione=` | No |
| GET | `/api/articles/featured` | Articoli in evidenza — max 4 | No |
| GET | `/api/articles/:id` | Articolo singolo | No |
| POST | `/api/articles` | Crea articolo | Sì |
| PUT | `/api/articles/:id` | Modifica articolo — solo autore | Sì |
| DELETE | `/api/articles/:id` | Elimina articolo — solo autore | Sì |
| POST | `/api/articles/:id/like` | Toggle like articolo | Sì |

### Commenti — `/api/articles/:articleId/comments`
| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| GET | `/api/articles/:articleId/comments` | Commenti di un articolo | No |
| POST | `/api/articles/:articleId/comments` | Crea commento | Sì |
| DELETE | `/api/articles/:articleId/comments/:id` | Elimina commento — autore o redazione | Sì |
| POST | `/api/articles/:articleId/comments/:id/like` | Toggle like commento | Sì |

### Utenti — `/api/users`
| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/:handle` | Profilo pubblico | No |
| GET | `/api/users/:handle/articles` | Articoli di un utente | No |
| PUT | `/api/users/me` | Modifica profilo — name, bio, avatar, cover | Sì |
| DELETE | `/api/users/me` | Elimina account + contenuti | Sì |

### Admin — `/api/admin` (protect + isAdmin)
| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | Lista tutti gli utenti | Redazione |
| PUT | `/api/admin/users/:id/block` | Toggle blocca/sblocca utente | Redazione |
| DELETE | `/api/admin/users/:id` | Elimina utente + contenuti | Redazione |
| PUT | `/api/admin/users/:id/badge` | Assegna badge | Redazione |
| PUT | `/api/admin/articles/:id/feature` | Toggle in evidenza | Redazione |
| DELETE | `/api/admin/articles/:id` | Elimina qualsiasi articolo | Redazione |

### Ricerca — `/api/search`
| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| GET | `/api/search?q=parola` | Ricerca articoli e utenti | No |

### Upload — `/api/upload`
| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload` | Upload immagine su Cloudinary — form-data, field: `image` | Sì |


## Scelte Progettuali

- **No slug negli articoli** — si usa `_id` MongoDB nell'URL
- **Handle non modificabile** — è l'identità pubblica del SexyTeller
- **isSensitive gestito lato frontend** — il backend manda sempre l'articolo; è il frontend che mostra la schermata 18+ se l'utente non è loggato
- **Badge automatico** — passa da `nuovo` ad `attivo` dopo 3 articoli pubblicati
- **Eliminazione a cascata** — elimina utente → elimina prima articoli e commenti
- **Protezione redazione** — non si può bloccare o eliminare un membro della redazione
- **Like con toggle** — stessa route POST per mettere e togliere like
- **CORS** — in produzione ristretto a `https://sexyteller.vercel.app`



## Deploy

Il backend è deployato su **Render**.
> https://sexyteller-backend.onrender.com

In produzione aggiornare:
- `GOOGLE_CALLBACK_URL` → `https://sexyteller-api.onrender.com/api/auth/google/callback`
- CORS origin → `https://sexyteller.vercel.app`


