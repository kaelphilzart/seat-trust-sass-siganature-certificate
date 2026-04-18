// services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinaryTemplate = async (file: string) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: "seal_trust/template",
    resource_type: "image",
    overwrite: true,
    unique_filename: false,
    use_filename: false,
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};

export const uploadToCloudinaryElement = async (file: string) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: "seal_trust/element-type",
    resource_type: "image",
    overwrite: true,
    unique_filename: false,
    use_filename: false,
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};

export const uploadToCloudinaryOrganizationAsset = async (file: string) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: "seal_trust/organization-asset",
    resource_type: "auto",
    overwrite: true,
    unique_filename: false,
    use_filename: false,
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};