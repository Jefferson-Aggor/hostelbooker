const moment = require("moment");

const formatDate = function (date) {
  return moment(date).format("ddd, MMM Do YYYY, h:mm a");
};

module.exports = { formatDate };
