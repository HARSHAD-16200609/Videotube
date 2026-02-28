import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

let isConfigured = false;

const uploadOnCloudinary = async (localFilePath) => {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    isConfigured = true;
  }

  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

   
     return response
      
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

const deleteFromCloudinary = async (publicId,resourcetype="image") => {

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    isConfigured = true;
  }

  try {
    if (!publicId) {
      console.log("No public ID provided for deletion");
      return null;
    }
    if(resourcetype === "image"){
  await cloudinary.uploader.destroy(publicId);
    }
   else if(resourcetype === "video"){
    await cloudinary.uploader.destroy(publicId, {
  resource_type: "video",
});
   }
  } catch (error) {
    console.log(`ERROR deleting from Cloudinary: ${error.message}`);
    return null;
  }
};


export { uploadOnCloudinary,deleteFromCloudinary };
