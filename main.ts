"use strict";
import express = require("express");
import {createClient} from "redis";
import {auth, requiresAuth} from "express-openid-connect";
// import {getUserByID, Category} from "./classes";
import {Dollars, Category, User} from "./simpleclasses";

const app = express();
const redis = createClient({
    username: "cbtfinancing",
    password: "password",
    socket: {
        host: 'host',
        port: 15765
    }
});
const authConfig = {
    authRequired: false,
    auth0Logout: true,
    secret: 'secret',
    baseURL: 'https://cbtfinancing.co',
    clientID: 'client',
    issuerBaseURL: 'https://dev-jmgvu5njpraaargw.us.auth0.com'
};

redis.on('ready', () => console.log('Redis Client Ready'));
redis.on('error', err => console.log('Redis Client Error', err));
redis.connect();

// The `auth` router attaches /login, /logout and /callback routes to the baseURL
app.use(auth(authConfig));
app.use(express.json());
app.use(express.static("static"));

app.get("/", (req, res) => {
    if (req.oidc.isAuthenticated())
        res.redirect("/static/index.html");
    else
        res.redirect("/login");
});

app.get("/api/authtest", requiresAuth(), (req, res) => {
    console.log(req.headers);
    console.log(req.oidc.user);
    res.send("obama");
});

app.get("/api/userfinances", requiresAuth(), async (req, res) => {
    const userID = req.oidc.user["sub"];
    const user = await getUserByID("users", userID, req.oidc.user["nickname"]);
    res.json(user.asObject()).send();
});

// The request should contain JSON of the form {name: string, expense: number, budget: number}
app.post("/api/addexpense", requiresAuth(), async (req, res) => {
    const userID = req.oidc.user["sub"];
    const expenseObj = req.body;
    let user = await getUserByID("users", userID, req.oidc.user["nickname"]);
    user.addCategory(Category.fromObject(expenseObj));
    await uploadUser("users", user);
    res.status(201).send();
});

app.delete("/api/deleteexpense", requiresAuth(), async (req, res) => {
    const userID = req.oidc.user["sub"];
    const expenseObj = req.body;
    let user = await getUserByID("users", userID);
    const removed = user.removeCategory(Category.fromObject(expenseObj));
    if (!removed) {
        res.status(404).send("Could not find the item that was requested to be deleted.");
        return;
    }
    await uploadUser("users", user);
    res.status(200).send();
});

/** Retrieves a user from the Redis database by their unique ID, returning them as a User object.
 * @param client The instantiated Redis client to use.
 * @param hashLocation The identifier for the hash in the Redis database.
 * @param id The unique ID of the user to retrieve.
 */
async function getUserByID(hashLocation: string, id: string, nickname?: string): Promise<User> {
    let result = await redis.hGet(hashLocation, id);
    let resultUser: User;

    if (result == null)
        resultUser = await makeNewUser(hashLocation, id, nickname);
    else {
        const resultObj = JSON.parse(result);
        for (let cat of resultObj.categories)
            resultUser.addCategory(Category.fromObject(cat));
        resultUser = new User(id, resultObj.name);
    }

    return resultUser;
}

async function uploadUser(hashLocation: string, user: User) {
    await redis.hSet(hashLocation, user.ID, JSON.stringify(user.asObject()));
}

async function makeNewUser(hashLocation: string, userID: string, nickname: string) {
    let newUser = new User(userID, nickname);
    await redis.hSet(hashLocation, userID, JSON.stringify(newUser.asObject()));
    return newUser;
}

app.on("error", (err) => {
    console.error(err);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});