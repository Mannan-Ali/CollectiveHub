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
//main problem 1. how will we make the subscriber part like onto channel like the page will be made for channeel so how will we get how many subs 
//2. for subscriber also when they login and go to a channel it should show subsribed ,answer manily boolen true false question is how 
export const Subscription = mongoose.model("Subscription", subscriptionSchema)
//NMAE OF THE DB WILL BE subscriptions as that how Mongdb works