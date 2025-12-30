import express from 'express'
import cookieParser from "cookie-parser";
import cors from 'cors';
import Userrouter from './routes/user.routes.js';
import videoRouter from './routes/videos.route.js';
import tweetRouter from './routes/tweet.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import playlistRouter from './routes/playlist.route.js';
import commentRouter from './routes/comment.route.js';
import likeRouter from './routes/like.route.js';
import dashBoardRouter from "./routes/dashboard.route.js"


const app = express();


//  middlewares 

app.use(cors({
    origin: "http://localhost:8000",
    credentials: true
}))
app.use(express.json({limit:"16kb"}))

app.use(express.static("public"))
app.use(cookieParser())
app.use("/api/v1/users",Userrouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/like",likeRouter)
app.use("/api/v1/dashboard",dashBoardRouter)




 export default app;