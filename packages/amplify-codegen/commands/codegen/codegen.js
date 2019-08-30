const constants = require('../../src/constants');
const codeGen = require('../../src');
const path = require('path');
const fs = require('fs-extra');
const loadConfig = require('../../src/codegen-config');
const featureName = 'codegen';

module.exports = {
  name: featureName,
  run: async (context) => {
    // Determine if working in an amplify project
    try {
      context.amplify.getProjectMeta();
    } catch(e) {
      context.withoutInit = true;
    }

    let schema = './schema.json';
    const schemaPath = path.join(process.cwd(), schema);
    if(!fs.existsSync(schemaPath) && context.withoutInit) {
      throw Error("Please download the introspection schema and place in " + schemaPath + " before codegen when not in an amplify project");
    }

    if (context.parameters.options.help) {
      const header = `amplify ${featureName} [subcommand] [[--nodownload] [--max-depth <number>]]\nDescriptions:
      Generates GraphQL statements (queries, mutations and subscriptions) and type annotations. \nSub Commands:`;

      const commands = [
        {
          name: 'types [--nodownload]',
          description: constants.CMD_DESCRIPTION_GENERATE_TYPES,
        },
        {
          name: 'statments [--nodownload] [--max-depth]',
          description: constants.CMD_DESCRIPTION_GENERATE_STATEMENTS,
        },
        {
          name: 'add',
          description: constants.CMD_DESCRIPTION_ADD,
        },
        {
          name: 'configure',
          description: constants.CMD_DESCRIPTION_CONFIGURE,
        },
      ];
      context.amplify.showHelp(header, commands);
      return;
    }
    if (context.parameters.first) {
      context.print.info(constants.CMD_DESCRIPTION_NOT_SUPPORTED);
      process.exit(1);
    }
    
    try {
      let forceDownloadSchema = !context.parameters.options.nodownload;
      if (context.withoutInit) {
        forceDownloadSchema = false;
      }
      let { maxDepth } = context.parameters.options;
      const config = loadConfig(context);
      if (!config.getProjects().length) {
        throw Error(constants.ERROR_CODEGEN_NO_API_CONFIGURED);
      }
      project = config.getProjects()[0];
      context.frontend = project.amplifyExtension.frontend;
      
      await codeGen.generate(context, forceDownloadSchema, maxDepth);
    } catch (e) {
      context.print.info(e.message);
      process.exit(1);
    }
  },
};
