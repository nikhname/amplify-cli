import { prompt } from 'enquirer';

type validatorFunction = (input: string) => boolean;

export async function executePrompt(promptQuestion: InputPrompt | SelectPrompt) {
  const answer: any = await prompt(promptQuestion);
  // logging possible here
  return answer[promptQuestion.name];
}

interface CliPrompt {
  name: string;
  promptMessage: string;
  initialValue?: string;
}

export class InputPrompt implements CliPrompt {
  type = 'input';
  validate?: (input: string) => string | true;
  constructor(public name: string, public promptMessage: string, public initialValue: string, validator: validatorFunction, invalidMessage: string) {
      (this.validate = input => validator(input) || invalidMessage);
  }
}

export class SelectPrompt implements CliPrompt {
  type = 'select';
  constructor(public name: string, public promptMessage: string, public choices: string[], public initialValue?: string) {
  }
}
