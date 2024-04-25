/*
1. Open up a socket server
2. Maintain a list of clients connected to the socket server
3. When a client sends a message to the socket server, forward it to all
connected clients
*/

import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'
import session from 'express-session'
import passport from 'passport'
import GitHubStrategy from 'passport-github2'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));


app.use(passport.initialize())
app.use(passport.session())

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: 'http://localhost:5173/auth/github/callback',
    passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
    req.session.user = {
        id: profile.id,
        username: profile.username,
        avatarUrl: profile.photos[0].value
    };
    done(null, profile);
}));


passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj, done) => {
    done(null, obj)
})

app.get('/auth/github', (req, res, next) => {
    console.log("GitHub Auth route hit");
    next();
}, passport.authenticate('github'));



app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/')
    }
)

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
})

const server = http.createServer( app ),
    socketServer = new WebSocketServer({ server }),
    clients = []

socketServer.on( 'connection', client => {
    console.log( 'connect!' )

    client.on( 'message', msg => {
        clients.forEach( c => { c.send( msg ) })
    })
    clients.push( client )
})

server.listen(5173, () => {
    console.log('Server is running on http://localhost:5173');
});

ViteExpress.bind( app, server )