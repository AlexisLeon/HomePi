/* eslint-disable no-console */
const chalk = require('chalk');

module.exports = (color, content) => console.log(chalk[color](content));
module.exports.colors = chalk;
