import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        //both subscriber and channel has object of user as both are made by users 
        subscriber : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        channel :{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {timestamps:true}
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)