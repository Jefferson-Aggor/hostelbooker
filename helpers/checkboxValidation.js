let init = "";
const validateCheckbox = function (body, string) {
  if (body === string) {
    return (init = true);
  } else {
    return (init = false);
  }
};

module.exports = validateCheckbox;
