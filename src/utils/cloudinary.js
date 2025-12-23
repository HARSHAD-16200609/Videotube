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

    return {
      secure_url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

const deleteFromCloudinary = async (localFilePath)=>{
  try{
    await cloudinary.uploader.destroy(localFilePath);  
  }catch(error){
console.log(`ERROR:${error.message}`)
  }
}


export { uploadOnCloudinary,deleteFromCloudinary };
