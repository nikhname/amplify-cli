import { executePrompt, SelectPrompt } from 'amplify-cli-core';
import { normalizeEditor } from '../extensions/amplify-helpers/editor-selection';

const PROMPT_NAME = "selectEditor"
const PROMPT_MESSAGE = 'Choose your default editor:';

function constructEditorQuestion(editors, initialEditor?): SelectPrompt {
  const normalizedInitialEditor = normalizeEditor(initialEditor);
  const editorPrompt = new SelectPrompt(PROMPT_NAME, PROMPT_MESSAGE, editors, normalizedInitialEditor);
  return editorPrompt;
}

export async function editorSelect(editors, initialEditor?): Promise<String> {
  const editorQuestion = constructEditorQuestion(editors, initialEditor);
  const answer = await executePrompt(editorQuestion);
  return answer;
}
