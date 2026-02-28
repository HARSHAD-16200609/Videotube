

 const async_handler =   (request_handler)=>async (req,res,next)=>{
  
    try{
     await request_handler(req,res,next)
        
    }
    catch(error)
    {
        console.log(`ERROR : ${error}`);
res.status(error.statusCode ||500).json({
    sucess:false,
    message:error.message
})        
    }
 }

 const async__handler = (request_handler)=>{

    return (res,req,next)=> {
        Promise.resolve(request_handler(req,res,next)).catch((err)=>{next(err)}
    )

    }
 }

 export {async_handler}