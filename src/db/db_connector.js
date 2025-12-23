import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

/*(async ()=>{
try{
   await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
}
catch(error){
    console.log(`ERROR: ${error}`);
    throw error;
}
})();
*/

async function connectdb(connection_url) {
  try {
     if (mongoose.connection.readyState === 1) {
      console.log("Database already connected");
      return;
    }
    const connection_instance = await mongoose.connect(connection_url);
    
    console.log(
      `DB connected sucessfully DB_HOST:${connection_instance.connection.host}`
    );
  } catch (err) {
    console.log(`ERROR CONNECTING TO THE DATABASE : ${err}`);

    process.exit(1);
  }
}

// connectdb(process.env.MONGO_URI)

export default connectdb;
