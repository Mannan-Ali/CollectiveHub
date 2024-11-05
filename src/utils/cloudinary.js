//we are making this as an util so we can use it for image ,vide and text .
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
/*
node js library mostly to manipulate files.
can read about fsPromise.unlink() this is like deleteting
what happens is when we delete a file it is unlinked from file system 
this is what it does 
*/

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        //this is for if the local file path does not exists like there is no file there 
        if (!localFilePath) return null;
        //we specify the file path in upload and also what kind of resourece of stuff we want to send 
        //that part should be in object
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File is Uploaded on Cloudinary!!! ", response.url);
        return response;

    } catch (error) {
        //now if the file does not exits or exits but has some error in it 
        //which we will become sure of from above so what we will do is unlink then from 
        //local files
        fs.unlinkSync(localFilePath)
        //remove the locally saved temp file as the upload does not happen
        return null;
    }
}

export {uploadOnCloudinary}