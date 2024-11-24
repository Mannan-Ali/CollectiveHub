import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (cloudinaryFilepath) => {
    try {
      if (!cloudinaryFilepath) return null;
      /*
    cloudinaryFilepath.split("/"): Splits the Cloudinary file path into an array of segments using / as the delimiter. For example, if the cloudinaryFilepath is "https://res.cloudinary.com/demo/image/upload/v1600451234/myImage.jpg", this will give you an array like ["https:", "", "res.cloudinary.com", "demo", "image", "upload", "v1600451234", "myImage.jpg"].
    .pop(): Retrieves the last element of this array. In the example above, it would return "myImage.jpg".

    .split(".")[0]: Splits the file name at the period (".") and takes the first part (the file name without the extension). So for "myImage.jpg", this would return "myImage".

    This is done to extract the public ID of the file stored on Cloudinary, which is what is needed to delete the file. The public ID is the part of the Cloudinary URL that uniquely identifies the file.
      */
      const fileName = cloudinaryFilepath.split("/").pop().split(".")[0];
      //we need public id part as destory function only takes that
      const response = await cloudinary.uploader.destroy(fileName);
      return response;
    } catch (error) {
      console.log("Error while deleting file from cloudinary : ", error);
      return null;
    }
  };

export {uploadOnCloudinary,deleteFromCloudinary};







// //we are making this as an util so we can use it for image ,vide and text .
// import { v2 as cloudinary } from 'cloudinary';
// import fs from "fs";
// /*
// node js library mostly to manipulate files.
// can read about fsPromise.unlink() this is like deleteting
// what happens is when we delete a file it is unlinked from file system
// this is what it does
// */

// // Configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
// });
// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         //this is for if the local file path does not exists like there is no file there
//         if (!localFilePath) {
//             return null
//         }
//         //we specify the file path in upload and also what kind of resourece of stuff we want to send
//         //that part should be in object
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })
//         console.log("File is Uploaded on Cloudinary!!! ", response.url);
//         // console.log(response)
//         return response;

//     } catch (error) {
//         //now if the file does not exits or exits but has some error in it
//         //which we will become sure of from above so what we will do is unlink then from
//         //local files
//         // fs.unlinkSync(localFilePath)
//         //remove the locally saved temp file as the upload does not happen
//         return null;
//     }
// }

// export {uploadOnCloudinary}