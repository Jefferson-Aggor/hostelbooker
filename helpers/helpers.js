const multer = require("multer");
const path = require("path");

module.exports = {
  multerDestination: function (dest) {
    return multer({ dest });
  },
  multerDiskstorage: function (dest) {
    const storage = multer.diskStorage({
      destination: dest,
      filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });

    return (upload = multer({
      storage: storage,
    }));
  },
};
