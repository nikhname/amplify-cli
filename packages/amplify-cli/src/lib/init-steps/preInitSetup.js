const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run(context) {
  if (context.parameters.options.app) {
    // Setting up a sample app
    context.print.warning('Note: GIT WARNING GOES HERE');
    const repoUrl = context.parameters.options.app;
    await validateGithubRepo(repoUrl);
    await cloneRepo(repoUrl);
    const packageManager = await getPackageManager();
    await installPackage(packageManager);
    await setLocalEnvDefaults(context);
  }
  return context;
}

/**
 * Checks whether a url is a valid address
 *
 * @param str the url to validated
 * @return true if str is a valid address, false otherwise
 */
async function isURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}

/**
 * Checks whether a url is a valid remote github repository
 *
 * @param repoUrl the url to validated
 * @throws error if url is not a valid remote github url
 */
async function validateGithubRepo(repoUrl) {
  if (await isURL(repoUrl)) {
    try {
      execSync(`git ls-remote ${repoUrl}`, { stdio: 'ignore' });
    } catch (e) {
      throw Error('Invalid remote github url');
    }
  } else {
    throw Error('Invalid url');
  }
}

/**
 * Clones repo from url to specified destination
 *
 * @param repoUrl the url to be cloned
 * @param dest the destination to clone to, defaults to current directory (.)
 */
async function cloneRepo(repoUrl) {
  execSync(`git clone ${repoUrl} .`, { stdio: 'inherit' });
}

/**
 * Determine the package manager of the current project
 *
 * @return 'yarn' if yarn.lock exists, 'npm' otherwise
*/
async function getPackageManager() {
  const yarnLock = './yarn.lock';
  const yarnLockDir = path.join(process.cwd(), yarnLock);
  if (fs.existsSync(yarnLockDir)) {
    return 'yarn';
  }
  return 'npm';
}

/**
 * Install package using the correct package manager
 *
 * @param packageManager either npm or yarn
 */
async function installPackage(packageManager) {
  if (packageManager === 'yarn') {
    await execSync('yarn install', { stdio: 'inherit' });
  } else {
    await execSync('npm install', { stdio: 'inherit' });
  }
}

/**
 * Set the default environment and editor for the local env
 *
 * @param context
 */
async function setLocalEnvDefaults(context) {
  const projectPath = process.cwd();
  const defaultEditor = 'vscode';
  const envName = 'sampledev';
  context.exeInfo.localEnvInfo = {
    projectPath,
    defaultEditor,
    envName,
  };
  context.exeInfo.inputParams.amplify.envName = envName;
  await generateLocalEnvInfoFile(context);
}

/**
 * Generate local-env-info.json file from context
 *
 * @param context
 */
async function generateLocalEnvInfoFile(context) {
  const { projectPath } = context.exeInfo.localEnvInfo;
  const jsonString = JSON.stringify(context.exeInfo.localEnvInfo, null, 4);
  const localEnvFilePath = context.amplify.pathManager.getLocalEnvFilePath(projectPath);
  fs.writeFileSync(localEnvFilePath, jsonString, 'utf8');
}

module.exports = {
  run,
};
