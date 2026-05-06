export interface PromptRunRecord {
  id: string;
  templateId: string;
  templateName: string;
  templateVersion: number;
  variables: Record<string, string>;
  systemPrompt: string;
  userPrompt: string;
  createdAt: string;
}
