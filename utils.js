// remove dash and capitalize
const clean = string => {
  const noDash = string.replace(/-/g, ' ').split(' ');
  return noDash.map(word => word.toUpperCase()[0] + word.substr(1)).join('_');
};

const formatTitle = urlParts =>
  `${urlParts.pop()}-${clean(urlParts[4])}_(${clean(urlParts[5])},${clean(urlParts[6])})`;

const utils = { clean, formatTitle };
module.exports = utils;
