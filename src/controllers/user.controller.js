  import { async_handler } from "../utils/async-handler";


  const register_user = async_handler((req,res)=>{{

   res.status(200).json({
    message:"OK"
   })
     
  }})

  export default register_user ;