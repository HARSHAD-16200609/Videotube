import mongoose ,{Schema} from "mongoose"


const subscriptionSchema= new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // subcribers of respecitive channel
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, // channel on videotube 
        ref:"User"
    }
},{timestamps:true })

// to prevent duplicate subscriptions in time of two request at same time 
//code cant handle this
subscriptionSchema.index(
  { subscriber: 1, channel: 1 },
  { unique: true }
);



const Subscription = mongoose.model("Subscription",subscriptionSchema)

export {Subscription}