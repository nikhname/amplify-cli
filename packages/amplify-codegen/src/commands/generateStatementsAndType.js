const { join } = require('path');
const {
  AmplifyCodeGenNoAppSyncAPIAvailableError: NoAppSyncAPIAvailableError,
} = require('../errors');
const generateTypes = require('./types');
const generateStatements = require('./statements');
const loadConfig = require('../codegen-config');
const constants = require('../constants');
const { ensureIntrospectionSchema, getAppSyncAPIDetails } = require('../utils');

async function generateStatementsAndTypes(context, forceDownloadSchema,
  maxDepth, withoutInit, decoupleFrontend) {
  const config = loadConfig(context);
  const projects = config.getProjects();

  let projectPath = process.cwd();
  if (!withoutInit) {
    ({ projectPath } = context.amplify.getEnvInfo());
  }
  let apis = [];
  if (!withoutInit) {
    apis = getAppSyncAPIDetails(context);
  }
  if (!projects.length || !apis.length) {
    if (!withoutInit) {
      throw new NoAppSyncAPIAvailableError(constants.ERROR_CODEGEN_NO_API_CONFIGURED);
    }
  }

  let downloadPromises;
  if (!withoutInit) {
    downloadPromises = projects.map(async cfg =>
      await ensureIntrospectionSchema(
        context,
        join(projectPath, cfg.schema),
        apis[0],
        cfg.amplifyExtension.region,
        forceDownloadSchema,
      ),
    );
    await Promise.all(downloadPromises);
  }
  await generateStatements(context, false, maxDepth, withoutInit, decoupleFrontend);
  await generateTypes(context, false, withoutInit, decoupleFrontend);
}

module.exports = generateStatementsAndTypes;
