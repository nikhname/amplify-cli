const loadConfig = require('../codegen-config');
const configureProjectWalkThrough = require('../walkthrough/configure');
const add = require('./add');

async function configure(context) {
  try {
    context.amplify.getProjectMeta();
  } catch(e) {
    context.withoutInit = true;
  }
  const config = loadConfig(context);
  if (!config.getProjects().length) {
    await add(context);
    return;
  }
  const project = await configureProjectWalkThrough(context, config.getProjects());
  config.addProject(project);
  config.save();
}

module.exports = configure;
