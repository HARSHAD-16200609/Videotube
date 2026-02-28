import jwt from "jsonwebtoken"
import {User} from "../models/users.model.js"
import { async_handler } from "../utils/async-handler.js"
import { API_Error } from "../utils/Api_error.js"


export const verifyJWT = async_handler(async(req,res,next)=>{

      try {
        
      
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // same as above
        // const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1]
        
        if (!token) {
            throw new API_Error(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password ")
    
        if (!user) {
            
            throw new API_Error(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new API_Error(401, error?.message || "Invalid access token")
    }

})