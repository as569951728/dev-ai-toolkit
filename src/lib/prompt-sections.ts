export function formatPromptSections(prompt: {
  systemPrompt: string;
  userPrompt: string;
}) {
  return `System prompt\n${prompt.systemPrompt}\n\nUser prompt\n${prompt.userPrompt}`;
}
