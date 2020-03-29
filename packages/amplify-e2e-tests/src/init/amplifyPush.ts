import { nspawn as spawn } from 'amplify-e2e-core';
import { getCLIPath } from '../utils';

const amplify = /^win/.test(process.platform) ? 'amplify.cmd' : 'amplify';

export function amplifyPush(cwd: string, useLocalCLI: Boolean = false) {
  const amplifySpawn = useLocalCLI ? amplify : getCLIPath();
  return new Promise((resolve, reject) => {
    spawn(amplifySpawn, ['push'], { cwd, stripColors: true })
      .wait('Are you sure you want to continue?')
      .sendLine('y')
      .wait('Do you want to generate code for your newly created GraphQL API')
      .sendLine('n')
      .wait(/.*/)
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

export function amplifyPushUpdate(cwd: string, waitForText?: RegExp) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['push'], { cwd, stripColors: true })
      .wait('Are you sure you want to continue?')
      .sendLine('y')
      .wait(waitForText || /.*/)
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

export function amplifyPushAuth(cwd: string, useLocalCLI: Boolean = false) {
  const amplifySpawn = useLocalCLI ? amplify : getCLIPath();
  return new Promise((resolve, reject) => {
    spawn(amplifySpawn, ['push'], { cwd, stripColors: true })
      .wait('Are you sure you want to continue?')
      .sendLine('y')
      .wait(/.*/)
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}
