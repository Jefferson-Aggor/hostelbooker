const moment = require("moment");

const formatDate = function (date) {
  return moment(date).format("ddd, MMM Do YYYY, h:mm a");
};

// paths
const pathLocation = function(value1 , value2, options){
  if (value1.toString() === value2.toString()) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

const container = function(value1 ,value2,options){
  let strToArr = value1.split('/')
  if (strToArr.find(x => x == value2.toString())){
    return options.fn(this);
  }else{
    return options.inverse(this);
  }
}

module.exports = { formatDate ,pathLocation,container};
