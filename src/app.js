import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(
  cors({
    //which which origins we are allowing it to access data from our server
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));


app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

//routes
import { router } from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import likeRouter from "./routes/likes.routes.js";
import commentRouter from "./routes/comment.routes.js";
//routes declaration
//NOTE : now as everthing is in different file you will have to use app.use that
//is a middleware instead of get,post to bring evething together

app.use(process.env.ROUTES_USER, router);
app.use(process.env.ROUTES_VIDEO, videoRouter);
app.use(process.env.ROUTES_TWEET, tweetRouter);
app.use(process.env.ROUTES_PLAYLIST, playlistRouter);
app.use(process.env.ROUTES_SUBSCRIPTION, subscriptionRouter);
app.use(process.env.ROUTES_LIKE, likeRouter);
app.use(process.env.ROUTES_COMMENT, commentRouter);
//Now what happens is using middle ware we are on router localhost:8000/api/v1/users which will call
//routers in user.router.js go there
export { app };
