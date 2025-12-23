import express from 'express'
import cookieParser from "cookie-parser";
import cors from 'cors';
import Userrouter from './routes/user.routes.js';


const app = express();


//  middlewares 

app.use(express.json({limit:"16kb"}))
app.use(cors({
    origin: "http://localhost:8000",
    credentials: true
}))
app.use(express.static("public"))
app.use(cookieParser())
app.use("/api/v1/users",Userrouter)






 export default app;