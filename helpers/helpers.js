const multer = require("multer");

module.exports = {
  multerDestination: function (dest) {
    return multer({ dest });
  },
};
