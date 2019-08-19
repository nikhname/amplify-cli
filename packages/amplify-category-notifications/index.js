const path = require('path');
const pinpointHelper = require('./lib/pinpoint-helper');
const multiEnvManager = require('./lib/multi-env-manager');

const pluginName = 'notifications';

async function console(context) {
  await pinpointHelper.console(context);
}

async function deletePinpointAppForEnv(context, envName) {
  await multiEnvManager.deletePinpointAppForEnv(context, envName);
}

async function initEnv(context) {
  await multiEnvManager.initEnv(context);
}

async function migrate(context) {
  await multiEnvManager.migrate(context);
}

async function executeAmplifyCommand(context) {
  let commandPath = path.normalize(path.join(__dirname, 'commands'));
  if (context.input.command === 'help') {
    commandPath = path.join(commandPath, pluginName);
  } else {
    commandPath = path.join(commandPath, pluginName, context.input.command);
  }

  const commandModule = require(commandPath);
  await commandModule.run(context);
}

async function handleAmplifyEvent(context, args) {
  console.log(`${pluginName} handleAmplifyEvent to be implmented`);
  context.amplify.print.info(`Received event args ${args}`);
}

module.exports = {
  console,
  deletePinpointAppForEnv,
  initEnv,
  migrate,
  executeAmplifyCommand,
  handleAmplifyEvent,
};

