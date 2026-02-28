class API_Error extends Error {


    constructor(
        statusCode
        ,err_msg = "Something went wrong" 
        ,errors=[],
        stack=""
    )
        {
        
      super(err_msg)
       this.statusCode=statusCode;
       this.success=false;
       this.errors=errors;
    }
}

export  {API_Error}