const express = require("express"),
    axios = require("axios"),
    path = require("path"),
    session = require("express-session"),
    { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"),
    socketIO = require('socket.io'),
    dotenv = require('dotenv').config({ path: "./.env" }),
    http = require('http'),
    app = express(),
    clientID = process.env.GITHUB_ID,
    clientSecret = process.env.GITHUB_SECRET;

app.use(express.static('public'))
app.use(express.json())
app.use(session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
})
);

const dbPwd = "admin"

const uri = `mongodb+srv://admin:${dbPwd}@cluster0.wsalwot.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let userdata = [];

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

const server = http.createServer(app)

var io = socketIO(server);

// make connection with user from server side
io.on('connection', (socket) => {
    console.log('New user connected');
    //emit message from server to user
    socket.emit('newMessage',
        {
            from: 'jen@mds',
            text: 'hepppp',
            createdAt: 123
        });

    // listen for message from user
    socket.on('createMessage',
        (newMessage) => {
            console.log('newMessage', newMessage);
        });

    // when server disconnects from user
    socket.on('disconnect',
        () => {
            console.log('disconnected from user');
        });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/auth/github/login", (req, res) => {
    res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${clientID}`
    );
});

app.get("/auth/github/callback", async (req, res) => {
    const requestToken = req.query.code;
    const response = await axios.post(
        `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
        {},
        {
            headers: {
                accept: "application/json",
            },
        }
    );

    access_token = response.data.access_token;

    req.session.accessToken = access_token;

    res.redirect("/success");
});

app.get("/success", async (req, res) => {
    if (!req.session.accessToken) {
        res.redirect("/auth/github/login");
        return;
    }

    const response = await axios.get("https://api.github.com/user", {
        headers: {
            Authorization: `token ${req.session.accessToken}`,
        },
    });
    const data = response.data;

    const info = { username: data.login, name: data.name, id: data.id, pfp: data.avatar_url }
    
    userdata.push(info);

    const body = JSON.stringify(info);

    // const cookieResponse = await fetch( "/store", {
    //     method:"POST",
    //     body
    //   }).then((aResponse)=>{
    //     console.log(aResponse);
    //   });

    res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/userdata", async (req, res) => {
    console.log(userdata);
    res.json(userdata);
})

app.get('/store', (req, res) => {
    // Save some data in the session
    req.session.username = req.body.username;
    res.send('Username set');
});

app.get('/retrieve', (req, res) => {
    // Check if the session data exists before trying to access it
    if (req.session.username) {
        res.send(`Here's your session data: ${req.session.username}`);
    } else {
        res.send('No session data found.');
    }
});

run().catch(console.dir);

server.listen(3000)

// Add a user into the database, use GitHub username as userID (?)
async function addUser(userID) {
    try {
        const db = client.db("webwareFinal");
        const collection = db.collection("users");

        // Define the document you want to insert
        const document = {
            userID: userID,
            wins: 0,
            losses: 0,
            history: [],
        };
        const result = await collection.insertOne(document);
        console.log(`Inserted document with _id: ${result.insertedId}`);
    } catch (err) {
        console.error("Error inserting document:", err);
    }
}

// Add a win to a user's account
async function addWin(userID) {
    try {
        const db = client.db("webwareFinal");
        const collection = db.collection("users");

        const result = await collection.updateOne({ userID: userID },
            { $inc: { wins: 1 } });

        // Log the result
        console.log(`Added win to ${userID}`);
    } catch (err) {
        console.error("Error adding win:", err);
    }
}
//Add a loss to a user's account
async function addLoss(userID) {
    try {
        const db = client.db("webwareFinal");
        const collection = db.collection("users");

        const result = await collection.updateOne({ userID: userID },
            { $inc: { losses: 1 } });

        // Log the result
        console.log(`Added loss to ${userID}`);
    } catch (err) {
        console.error("Error adding loss:", err);
    }
}

// Add a game to the user's history
async function addGameHistory(userID, gameID) {
    try {
        await client.connect();
        const db = client.db("webwareFinal");
        const collection = db.collection('users');

        // Find the user document with the matching userID
        const user = await collection.findOne({ userID: userID });

        if (!user) {
            console.error(`User with ID ${userID} not found`);
            return; // Exit the function if user is not found
        }

        // Update the user document to add gameID to the history array
        const result = await collection.updateOne(
            { userID: userID },
            { $push: { history: gameID } }
        );

        console.log(`Added game ${gameID} to history of user ${userID}`);
        return result;
    } catch (err) {
        console.error("Error adding game history:", err);
        throw err; // Re-throw the error to handle it where the function is called
    } finally {
        await client.close();
    }
}

// Set the winner of a game
async function updateWinner(gameID, userID) {
    try {
        // Connect to the database
        const db = client.db("webwareFinal");

        // Update the document
        const result = await db.collection('games').updateOne(
            { gameID: gameID },
            { $set: { winner: userID } }
        );

        if (result.modifiedCount === 1) {
            console.log('Winner updated successfully.');
        } else {
            console.log('No document updated.');
        }
    } catch (err) {
        console.log('Error occurred while updating winner:', err);
    }
}

// Call to end a game. Adds win/loss data to players and sets history. Takes in a gameID, the winnerID, and array of loserIDs
async function concludeGame(gameID, winnerID, loserIDs) {
    // Add a win to winner, add game to user history, set winner of game
    await addWin(winnerID);
    await addGameHistory(winnerID, gameID)
    await updateWinner(gameID, winnerID)

    for (let loserID of loserIDs) {
        await addLoss(loserID)
        await addGameHistory(loserID, gameID)
    }

    console.log(`The game is over! ${winnerID} wins!`)
}