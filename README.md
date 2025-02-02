# 🏢 CollectiveHub

**CollectiveHub** is a backend-driven platform that combines the core logic of social media (like Twitter) and video-sharing platforms (like YouTube).The project that allows users to upload, share and interact with multimedia (videos/images), and incorporate
features such as tweets, subscriptions, comments and likes.


## 📜 Features

- **User Authentication**: Secure login and signup using JWT (JSON Web Tokens) for authentication.
- **Refresh & Access Tokens**: Implements refresh tokens to maintain user sessions without requiring frequent logins, improving both security and user experience
- **Content Sharing**: Users can upload and share videos and images.
- **Media Management**: Seamless image/video uploading and storage using Cloudinary.
- **User Interaction**: Like and comment on posts, similar to social media platforms.
- **Database Integration**: MongoDB to store user data, media content, and interactions.Videos are stored on Cloudinary and the link from there is stroed in MongDB
- **Search Using Pagination **: Users can search for content and see a feed of uploaded videos/images.
- **Real-Time Updates**: Notification-like feature for user engagement.


## 🚀 Installation and Setup

Follow these steps to get the **CollectiveHub** up and running locally:

```bash
  git clone https://github.com/Mannan-Ali/CollectiveHub.git
```

Go to the project directory

```bash
  cd youtube_Backend_Project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## 🛠️ Environment Variables  

To run this project, create a `.env` file in the root directory and add the following variables:
The ROUTES in the env are   

```env
PORT = port number on which the server runs
MONGODB_URI = MongoDB connection string to connect to the database.
CORS_ORIGIN = The allowed origins for Cross-Origin Resource Sharing (CORS).
ACCESS_TOKEN_SECRET = A secret key used to sign access tokens for authentication. 
ACCESS_TOKEN_EXPIRY = Expiration time for access tokens
REFRESH_TOKEN_SECRET = A secret key used to sign refresh tokens.
REFRESH_TOKEN_EXPIRY = Expiration time for refresh tokens
CLOUDINARY_CLOUD_NAME = Cloudinary cloud name for media storage.
CLOUDINARY_API_KEY = Cloudinary API key for authentication.
CLOUDINARY_API_SECRET = Cloudinary API secret key for secure API access.

#This ROUTES in the environment variables are used to define API endpoints for different functionalities.

ROUTES_USER = 
ROUTES_VIDEO = 
ROUTES_TWEET = 
ROUTES_PLAYLIST = 
ROUTES_SUBSCRIPTION = 
ROUTES_LIKE = 
ROUTES_COMMENT = 
```