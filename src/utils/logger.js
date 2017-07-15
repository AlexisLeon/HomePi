/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */
const chalk = require('chalk');

// Log data with up to 3 different colors
module.exports = (color, content, color1, content1, color2, content2) => {
  if (color1 && content1) {
    if (color2 && content2) {
      console.log(chalk[color](content), chalk[color1](content1), chalk[color2](content2));
    }

    console.log(chalk[color](content), chalk[color1](content1));
  } else {
    console.log(chalk[color](content));
  }
};
module.exports.colors = chalk;
