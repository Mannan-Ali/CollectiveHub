import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

//to interact with middleware like bodyparser we use app.use 
//even cors is used this way
//cors is used to specify which url request to allow
app.use(cors({
    //which which origins we are allowing it to access data from our server
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//now the data we will get on our server will be in different format like some will
//be from params some in json form some in form body etc . now if we are taking json data
//then we will like to limit the amount of json data that is done using this 
//to do this we have used body-parser but now it can be direclty done in express
app.use(express.json({ limit: "16kb" }))

//for URL : now we know in url we get data in encoded form like ?wfwewefe
// so here we needed to tell the server take care of those reqs that are coming directly 
//from url to decode it
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

/*
we have seen this before in web dev course : it is used so that the static files 
can be rendered like images here
If you don’t include the express.static("public") line, the server won’t automatically serve any 
files (like images, stylesheets, or JavaScript) stored in the public folder to users. This means that if the frontend (a web page in the browser) tries to load an image or file from the public folder,
it won’t find it and will throw a “404 Not Found” error.

you tell the server to serve files from the public folder whenever they’re requested by the browser.
For example, if there’s an image named logo.png in the public folder, 
the browser can access it directly at http://yourserver.com/logo.png.
*/
app.use(express.static("public"))

//using this we can access and also sendthe cookies from the
//incoming request from the client side (browser).
//mainly the cookies are secure cooikies that can read and implemented by servers
app.use(cookieParser())

//routes 
import { router } from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
//routes declaration
//NOTE : now as everthing is in different file you will have to use app.use that 
//is a middleware instead of get,post to bring evething together

app.use("/api/v1/users",router)
app.use("/api/v1/videos", videoRouter)
//Now what happens is using middle ware we are on router localhost:8000/api/v1/users which will call 
//routers in user.router.js go there
export { app };






/*
Yes, exactly! You’re setting up rules for how different frontends (like browsers or other apps) can interact with your server.

Cross-origin settings (cors) define who can access your server’s resources.
Data limits (json and urlencoded) set how much data they can send to your server, helping to prevent overloading or abuse.
Static files (static) make certain resources available for frontends to use, like images or scripts.
Cookies (cookieParser) allow the server to read small pieces of data stored on the frontend, typically used for things like sessions or tracking preferences.
Each part is about defining and controlling the data flow between the server and any frontend that connects to it.

You said:
if this things were not done still the data would be able to send right?
ChatGPT said:
ChatGPT
Yes, data could still be sent without these configurations, but these setups add important controls and structure:
*/