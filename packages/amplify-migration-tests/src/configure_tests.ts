import configure from './configure';
import { isCI } from './utils';
import { spawnSync } from 'child_process';
const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

async function setupAmplify(version: string = 'latest') {
  // install cli to be used for migration test initialization
  spawnSync(npm, ['install', '-g', `@aws-amplify/cli@${version}`]);
  if (isCI()) {
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
    }
    await configure({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      profileName: 'amplify-integ-test-user',
    });
  } else {
    console.log('AWS Profile is already configured');
  }
}

process.nextTick(async () => {
  try {
    // check if cli version was passed to setup-profile
    if (process.argv.length > 2) {
      const cliVersion = process.argv[2];
      await setupAmplify(cliVersion);
    } else {
      await setupAmplify();
    }
  } catch (e) {
    console.log(e.stack);
    process.exit(1);
  }
});
