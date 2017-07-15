const { colors } = require('./logger');

exports.printPin = (pincode) => {
  console.log("Scan this code to pair with HomePi:");
  console.log(colors.black.bgWhite("                       "));
  console.log(colors.black.bgWhite("    ┌────────────┐     "));
  console.log(colors.black.bgWhite(`    │ ${pincode} │     `));
  console.log(colors.black.bgWhite("    └────────────┘     "));
  console.log(colors.black.bgWhite("                       "));
}
