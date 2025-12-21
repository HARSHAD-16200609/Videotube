import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cookieParser from "cookie-parser";
import cors from 'cors';
import upload from "./middlewares/multer.middleware.js";
import { uploadOnCloudinary } from './utils/cloudinary.js';
import connectdb from "./db/db_connector.js";


const port = process.env.PORT || 5000
const app = express();


//  middlewares 

app.use(express.json({limit:"16kb"}))
app.use(cors())
app.use(express.static("public"))
app.use(cookieParser())



app.post("/upload",upload.single("profile"),function(req,res,next){

   console.log(req.file);
   console.log(req.body);
   uploadOnCloudinary(req.file.path)
   
  res.send('ok')
})

connectdb(process.env.MONGO_URI)
.then(()=>{
    app.on("error",(error)=>{
        console.log(`ERROR: ${error}`);
        
    })
  app.listen(port,()=>{
    console.log(`DB Connected sucesssfully and server listening on port :${port}`);
    
  })
})
.catch((error)=>{
    console.log(`DB Failed to connect error : ${error}`);
    process.exit(1);
})



 export default app;