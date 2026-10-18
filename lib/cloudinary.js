import { v2 as cloudinary } from "cloudinary";

// Load CLOUDINARY_URL when present, then let individual environment values
// override it for deployments that use separate variables.
cloudinary.config();
const overrides = Object.fromEntries(
  [
    ["cloud_name", process.env.CLOUDINARY_CLOUD_NAME],
    ["api_key", process.env.CLOUDINARY_API_KEY],
    ["api_secret", process.env.CLOUDINARY_API_SECRET],
  ].filter(([, value]) => value),
);
cloudinary.config(overrides);

export default cloudinary;
