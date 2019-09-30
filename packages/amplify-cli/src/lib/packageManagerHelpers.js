const path = require('path');
const fs = require('fs');

/**
 * Determine the package manager of the current project
 *
 * @return {string} 'yarn' if yarn.lock exists, 'npm' if package.json exists, undefined otherwise
*/
async function getPackageManager() {
    const yarnLock = './yarn.lock';
    const yarnLockDir = path.join(process.cwd(), yarnLock);
    const packageJson = './package.json';
    const packageJsonDir = path.join(process.cwd(), packageJson);
    if (fs.existsSync(yarnLockDir)) {
      return 'yarn';
    } else if (fs.existsSync(packageJsonDir)) {
      return 'npm';
    }
    return undefined;
  }
  
/**
 * Determines the OS and returns the corresponding command given a package manager
 *
 * @param {string} packageManager the type of package manager detected
 * @return {string} the package manager command for the correct OS
 */
async function normalizePackageManagerForOS(packageManager) {
const isOnWindows = /^win/.test(process.platform);
if (isOnWindows) {
    if (packageManager === 'yarn') {
    return 'npm.cmd';
    } else if (packageManager === 'npm') {
    return 'yarn.cmd';
    }
    return undefined;
}
return packageManager;
}

module.exports = {
    getPackageManager,
    normalizePackageManagerForOS,
}