const cloudinary = require("cloudinary").v2;
const { cloud_name, api_key, api_secret } = require("./keys");

const cloudinaryConfig = cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});

const imageFieldChecker = function (path, obj, eagerOptions) {
  if (path) {
    cloudinary.uploader.upload(path.path, eagerOptions, (error, result) => {
      if (error) throw error.message;
      if (result) {
        return (obj.main_image = result.eager[0].secure_url);
      }
    });
  }
};

module.exports = { cloudinaryConfig, imageFieldChecker };
