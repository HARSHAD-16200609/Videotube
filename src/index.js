import dotenv from 'dotenv'
dotenv.config();
import connectdb from "./db/db_connector.js";

import app from "./app.js"



const port = process.env.PORT || 5000
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