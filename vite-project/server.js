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

const app = express()

const server = http.createServer( app ),
    socketServer = new WebSocketServer({ server }),
    clients = []

    app.use(session({
        secret: 'your_secret_here',
        resave: true,
        saveUninitialized: true
    }))
    
    app.use(passport.initialize())
    app.use(passport.session())
    
    passport.use(new GitHubStrategy({
        clientID: 'your_github_client_id',
        clientSecret: 'your_github_client_secret',
        callbackURL: 'http://localhost:5173/auth/github/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        return done(null, profile)
    }))
    
    passport.serializeUser((user, done) => {
        done(null, user)
    })
    
    passport.deserializeUser((obj, done) => {
        done(null, obj)
    })
    
    app.get('/auth/github', passport.authenticate('github'))
    
    app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
        (req, res) => {
            // Successful authentication, redirect home.
            res.redirect('/')
        }
    )

socketServer.on( 'connection', client => {
    console.log( 'connect!' )

    // when the server receives a message from this client...
    client.on( 'message', msg => {
        // send msg to every client EXCEPT the one who originally sent it
        clients.forEach( c => { c.send( msg ) })
    })

    // add client to client list
    clients.push( client )
})

server.listen( 3000 )

ViteExpress.bind( app, server )