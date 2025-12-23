class Api_Response{


    constructor(statusCode,data,message="Sucess"){
this.statusCode=statusCode,
this.data=data,
this.message=message,
this.success=statusCode >= 200 && statusCode < 300
    }
}

export {Api_Response}