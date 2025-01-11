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

/* 
CHECK NOTEBOOK FOR FIGURE WISE EXPLANATION
NOW what is happeing we are not creating array or object for this 
because there can be 10 milliion subs so it will be tuff thats why 
new document for 
Now ->

lets say USER1 subscribed to VOID 
this will create a new document where : channel -> VOID 
                                        subscriber -> USER1
this whole is a object or in database term document 

lets say USER2 subscribed to VOID 
this will create a new document where : channel -> VOID 
                                        subscriber -> USER2
This is a whole new document we are not adding it to the same object or doucment 

llly if USER1 wants to subscribe to CHC so : Channel : CHC
                                             Susbcriber : USER1
agin new doc
*/ 