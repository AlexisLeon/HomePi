const fs = require('fs');
const path = require('path');

function getVersion() {
  const pkgPath = path.join(__dirname, '../../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  return pkg.version;
}

module.exports = getVersion();
