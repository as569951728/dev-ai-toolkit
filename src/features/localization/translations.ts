import { promptTemplateTranslations } from '@/features/localization/prompt-template-translations';
import { promptPlaygroundTranslations } from '@/features/localization/prompt-playground-translations';
import { promptRunTranslations } from '@/features/localization/prompt-run-translations';
import { promptDiffTranslations } from '@/features/localization/prompt-diff-translations';

export const translations = {
  en: {
    'app.tagline': 'Local-first prompt workspace',
    'language.label': 'Language',
    'language.chinese': '中文',
    'language.english': 'English',
    'navigation.primary': 'Primary',
    'navigation.open': 'Open navigation',
    'navigation.close': 'Close navigation',
    'navigation.group.start': 'Start here',
    'navigation.group.prompts': 'Prompt Workflows',
    'navigation.group.utilities': 'Developer Utilities',
    'navigation.group.workspace': 'Workspace',
    'navigation.overview': 'Overview',
    'navigation.templates': 'Prompt Templates',
    'navigation.playground': 'Prompt Playground',
    'navigation.runs': 'Run History',
    'navigation.diff': 'Prompt Diff',
    'navigation.json': 'JSON Tools',
    'navigation.api': 'API Builder',
    'navigation.code': 'Code Viewer',
    'navigation.backup': 'Backup',
    'layout.skip': 'Skip to main content',
    'layout.loading': 'Loading page...',
    'footer.question': 'Used the prompt workflow for a real task?',
    'footer.guidance':
      'Share what slowed you down without including private prompt content.',
    'footer.source': 'View source',
    'footer.feedback': 'Share workflow feedback',
    'notFound.eyebrow': 'Page not found',
    'notFound.title': 'We could not find that page.',
    'notFound.description':
      'The route may have changed, or the page may only exist in a future version of the toolbox.',
    'notFound.action': 'Back to Overview',
    'storage.unavailable':
      'Browser storage is unavailable. Templates, prompt snapshots, and notes cannot be saved in this browser context.',
    'storage.recovery.title': 'Some local workspace data could not be read.',
    'storage.recovery.description':
      'The original browser values are unchanged, and writes to the affected data are blocked. Download them before resetting if you may need to inspect or repair them later.',
    'storage.recovery.download': 'Download unreadable data',
    'storage.recovery.reset': 'Reset affected data',
    'storage.recovery.downloadError':
      'The unreadable browser data could not be downloaded. It has not been removed.',
    'storage.recovery.resetError':
      'The unreadable browser data could not be fully reset. It remains available for download in this session.',
    'storage.recovery.dialogTitle': 'Reset unreadable local data?',
    'storage.recovery.dialogDescription':
      'This permanently removes only the affected browser values and reloads the app. Download them first if you may need the original content.',
    'storage.recovery.keep': 'Keep current data',
    'storage.recovery.confirm': 'Reset and reload',
    'title.overview': 'Overview',
    'title.playground': 'Prompt Playground',
    'title.runs': 'Run History',
    'title.run': 'Prompt Run',
    'title.templates': 'Prompt Templates',
    'title.template': 'Prompt Template',
    'title.createTemplate': 'Create Prompt Template',
    'title.editTemplate': 'Edit Prompt Template',
    'title.json': 'JSON Tools',
    'title.api': 'API Builder',
    'title.code': 'Code Viewer',
    'title.diff': 'Prompt Diff',
    'title.workspace': 'Workspace Backup',
    'title.notFound': 'Page Not Found',
    'home.hero.eyebrow': 'Open Source Developer Tool',
    'home.hero.title':
      'A local-first workspace for prompt work and small developer utilities.',
    'home.hero.summary':
      'dev-ai-toolkit is a small React app for managing prompt templates, saving prompt runs, and handling adjacent tasks like JSON cleanup, request drafting, and output review.',
    'home.primary.openTemplate': 'Open {name}',
    'home.primary.createTemplate': 'Create first template',
    'home.primary.manageTemplates': 'Manage prompt templates',
    'home.metric.active': 'Active templates',
    'home.metric.activeDescription':
      'Ready to preview, duplicate, import, and export.',
    'home.metric.workflow': 'Core workflow',
    'home.metric.workflowValue': 'Template to Snapshot',
    'home.metric.workflowDescription':
      'Compose, save, review, and reuse prompts without a backend.',
    'home.metric.runs': 'Saved prompt runs',
    'home.metric.runsDescription':
      'Snapshots stay available as reusable local activity history.',
    'home.start.eyebrow': 'Start here',
    'home.start.title':
      'Start with templates, then compose and review prompt snapshots.',
    'home.start.templateTitle': 'Choose or create a template',
    'home.start.templateDescription':
      'Start in Prompt Templates and keep the prompts you expect to reuse.',
    'home.start.templateAction': 'Open Prompt Templates',
    'home.start.playgroundTitle': 'Run it in the playground',
    'home.start.playgroundDescription':
      'Fill variables and preview the final prompt before you save the run.',
    'home.start.playgroundAction': 'Open Prompt Playground',
    'home.start.snapshotTitle': 'Save a reviewable snapshot',
    'home.start.snapshotDescription':
      'Save the composed prompts, then return from history to review or reuse the captured variables.',
    'home.start.snapshotAction': 'Open Run History',
    'home.value.eyebrow': 'Why this app exists',
    'home.value.title':
      'Built for repeated prompt work, not just one-off chat sessions.',
    'home.value.one':
      'Keep reusable prompt templates, captured variables, and review notes in one local workspace.',
    'home.value.two':
      'Turn repeated prompt work into snapshots you can compare, reuse, and back up.',
    'home.value.three':
      'Stay lightweight while the project is still browser-only and local-first.',
    'home.modules.eyebrow': 'Current modules',
    'home.modules.title':
      'The current app is split between prompt work and supporting utilities.',
    'home.modules.prompts.title': 'Prompt Workflows',
    'home.modules.prompts.description':
      'Manage reusable templates, compose prompts with variables, and review saved snapshots over time.',
    'home.modules.utilities.title': 'Developer Utilities',
    'home.modules.utilities.description':
      'Handle JSON payloads, draft API requests, and inspect output alongside the prompt workflow.',
    'home.module.templates.description':
      'Create, organize, search, and reuse prompt templates for recurring development tasks.',
    'home.module.templates.meta': 'Manage template inventory',
    'home.module.playground.description':
      'Fill variables, preview composed system and user prompts, and save a local snapshot.',
    'home.module.playground.meta': 'Compose reusable prompts',
    'home.module.diff.description':
      'Compare prompt revisions, check variable drift, and review wording changes.',
    'home.module.diff.meta': 'Review prompt revisions',
    'home.module.runs.description':
      'Review prompt snapshots, trace them to template versions, and reopen captured variables in the playground.',
    'home.module.runs.meta': 'Browse prompt snapshots',
    'home.module.json.description':
      'Format, validate, minify, and clean JSON payloads.',
    'home.module.json.meta': 'Inspect structured data',
    'home.module.api.description':
      'Compose request URLs, headers, query params, and payloads, then generate fetch snippets or cURL commands.',
    'home.module.api.meta': 'Draft request configurations',
    'home.module.code.title': 'Code Output Viewer',
    'home.module.code.description':
      'Inspect code or text output in single or compare mode.',
    'home.module.code.meta': 'Review generated output',
    'home.module.action': 'Explore module',
    'home.pattern.eyebrow': 'Working pattern',
    'home.pattern.title':
      'The app stays simple: compose prompts, review snapshots, and keep useful context.',
    'home.pattern.templateTitle': 'Start from a prompt template',
    'home.pattern.templateDescription':
      'Choose an existing template or create one for a repeated development task.',
    'home.pattern.composeTitle': 'Compose the prompt',
    'home.pattern.composeDescription':
      'Fill the current template variables and review the composed system and user prompts.',
    'home.pattern.reviewTitle': 'Review and reuse the snapshot',
    'home.pattern.reviewDescription':
      'Save a snapshot, add review context, or reopen its captured variables for the next iteration.',
    'home.cases.eyebrow': 'Common use cases',
    'home.cases.title':
      'These are the kinds of small development tasks the current app already supports.',
    'home.cases.label': 'Common use cases',
    'home.case.codeReview': 'Code review preparation',
    'home.case.apiDesign': 'API design assistance',
    'home.case.bugTriage': 'Bug triage and debugging',
    'home.case.standardization': 'Team prompt standardization',
    'home.case.json': 'JSON payload validation',
    'home.case.requests': 'Request scaffolding for frontend and backend work',
    'home.case.output': 'Comparing generated code or rewritten output',
    'home.case.revisions': 'Checking prompt revisions before sharing a template',
    'home.activity.eyebrow': 'Recent activity',
    'home.activity.title':
      'Recent prompt snapshots stay visible when you return to the workspace.',
    'home.activity.runMeta': 'Prompt Run',
    'home.activity.runDescription.one':
      'Saved from template version v{version} with {count} captured variable.',
    'home.activity.runDescription.other':
      'Saved from template version v{version} with {count} captured variables.',
    'home.activity.open': 'Open run detail',
    'home.activity.emptyTitle': 'No activity yet',
    'home.activity.emptyDescription':
      'Save a prompt snapshot in the playground and it will appear here for later review.',
    'home.direction.eyebrow': 'Current direction',
    'home.direction.title':
      'The focus is improving the local prompt workflow before adding broader platform features.',
    'home.direction.stage': 'Stage {number}',
    'home.direction.foundationTitle': 'Prompt workflow foundation',
    'home.direction.foundationSummary':
      'Keep the template, playground, snapshot, and run review path clear and reliable.',
    'home.direction.reliabilityTitle': 'Review and data reliability',
    'home.direction.reliabilitySummary':
      'Improve snapshot review, local validation, backup safety, and browser-level coverage.',
    'home.direction.connectionsTitle': 'Focused utility connections',
    'home.direction.connectionsSummary':
      'Connect supporting utilities only where they make the prompt workflow easier to complete.',
    ...promptTemplateTranslations.en,
    ...promptPlaygroundTranslations.en,
    ...promptRunTranslations.en,
    ...promptDiffTranslations.en,
  },
  'zh-CN': {
    'app.tagline': '本地优先的 Prompt 工作台',
    'language.label': '界面语言',
    'language.chinese': '中文',
    'language.english': 'English',
    'navigation.primary': '主导航',
    'navigation.open': '打开导航',
    'navigation.close': '关闭导航',
    'navigation.group.start': '开始使用',
    'navigation.group.prompts': 'Prompt 工作流',
    'navigation.group.utilities': '开发者工具',
    'navigation.group.workspace': '工作区',
    'navigation.overview': '概览',
    'navigation.templates': 'Prompt 模板',
    'navigation.playground': 'Prompt 调试台',
    'navigation.runs': '运行记录',
    'navigation.diff': 'Prompt 对比',
    'navigation.json': 'JSON 工具',
    'navigation.api': 'API 构建器',
    'navigation.code': '代码查看器',
    'navigation.backup': '备份',
    'layout.skip': '跳到主要内容',
    'layout.loading': '页面加载中...',
    'footer.question': '已经用 Prompt 工作流处理过真实任务？',
    'footer.guidance': '欢迎反馈卡住你的步骤，请勿提交私密 Prompt 内容。',
    'footer.source': '查看源码',
    'footer.feedback': '提交使用反馈',
    'notFound.eyebrow': '页面不存在',
    'notFound.title': '找不到这个页面。',
    'notFound.description': '页面地址可能已经变化，或者该功能尚未实现。',
    'notFound.action': '返回概览',
    'storage.unavailable':
      '当前浏览器无法使用本地存储，因此不能保存模板、Prompt 快照和备注。',
    'storage.recovery.title': '部分本地工作区数据无法读取。',
    'storage.recovery.description':
      '原始浏览器数据没有被修改，受影响的数据也已禁止写入。如果之后可能需要检查或修复，请先下载原始数据再重置。',
    'storage.recovery.download': '下载无法读取的数据',
    'storage.recovery.reset': '重置受影响的数据',
    'storage.recovery.downloadError': '无法下载这些数据，原始数据尚未被删除。',
    'storage.recovery.resetError':
      '无法完全重置这些数据，本次会话中仍可下载原始内容。',
    'storage.recovery.dialogTitle': '确定重置无法读取的本地数据？',
    'storage.recovery.dialogDescription':
      '此操作只会永久删除受影响的浏览器数据，然后重新加载应用。如果可能需要原始内容，请先下载。',
    'storage.recovery.keep': '保留当前数据',
    'storage.recovery.confirm': '重置并重新加载',
    'title.overview': '概览',
    'title.playground': 'Prompt 调试台',
    'title.runs': '运行记录',
    'title.run': 'Prompt 运行记录',
    'title.templates': 'Prompt 模板',
    'title.template': 'Prompt 模板详情',
    'title.createTemplate': '新建 Prompt 模板',
    'title.editTemplate': '编辑 Prompt 模板',
    'title.json': 'JSON 工具',
    'title.api': 'API 构建器',
    'title.code': '代码查看器',
    'title.diff': 'Prompt 对比',
    'title.workspace': '工作区备份',
    'title.notFound': '页面不存在',
    'home.hero.eyebrow': '开源开发者工具',
    'home.hero.title': '用于 Prompt 工作和小型开发工具的本地优先工作台。',
    'home.hero.summary':
      'dev-ai-toolkit 是一个小型 React 应用，用于管理 Prompt 模板、保存运行快照，以及处理 JSON 整理、请求草拟和输出审查等相关任务。',
    'home.primary.openTemplate': '打开{name}',
    'home.primary.createTemplate': '创建第一个模板',
    'home.primary.manageTemplates': '管理 Prompt 模板',
    'home.metric.active': '可用模板',
    'home.metric.activeDescription': '可以预览、复制、导入和导出。',
    'home.metric.workflow': '核心工作流',
    'home.metric.workflowValue': '从模板到快照',
    'home.metric.workflowDescription': '无需后端即可组合、保存、复盘和复用 Prompt。',
    'home.metric.runs': '已保存的运行记录',
    'home.metric.runsDescription': '快照会作为可复用的本地活动记录保留下来。',
    'home.start.eyebrow': '从这里开始',
    'home.start.title': '先选择模板，再组合并复盘 Prompt 快照。',
    'home.start.templateTitle': '选择或创建模板',
    'home.start.templateDescription': '从 Prompt 模板开始，保存你预计会重复使用的内容。',
    'home.start.templateAction': '打开 Prompt 模板',
    'home.start.playgroundTitle': '在调试台中使用模板',
    'home.start.playgroundDescription': '填写变量并预览最终 Prompt，然后再保存运行记录。',
    'home.start.playgroundAction': '打开 Prompt 调试台',
    'home.start.snapshotTitle': '保存可复盘的快照',
    'home.start.snapshotDescription':
      '保存组合后的 Prompt，之后可以从运行记录中复盘或复用变量。',
    'home.start.snapshotAction': '打开运行记录',
    'home.value.eyebrow': '为什么做这个工具',
    'home.value.title': '面向重复的 Prompt 工作，而不是一次性的聊天。',
    'home.value.one': '在一个本地工作区中管理可复用模板、变量和复盘备注。',
    'home.value.two': '把重复的 Prompt 工作保存成可比较、复用和备份的快照。',
    'home.value.three': '保持浏览器本地运行，不引入不必要的平台复杂度。',
    'home.modules.eyebrow': '当前模块',
    'home.modules.title': '当前功能分为 Prompt 工作流和辅助开发工具。',
    'home.modules.prompts.title': 'Prompt 工作流',
    'home.modules.prompts.description':
      '管理可复用模板，填写变量组合 Prompt，并持续复盘保存的快照。',
    'home.modules.utilities.title': '开发者工具',
    'home.modules.utilities.description':
      '配合 Prompt 工作流处理 JSON、草拟 API 请求并检查输出。',
    'home.module.templates.description': '为重复的开发任务创建、整理、搜索和复用 Prompt 模板。',
    'home.module.templates.meta': '管理模板库',
    'home.module.playground.description':
      '填写变量、预览 System Prompt 和 User Prompt，并保存本地快照。',
    'home.module.playground.meta': '组合可复用 Prompt',
    'home.module.diff.description': '比较 Prompt 版本、检查变量变化并审查文案调整。',
    'home.module.diff.meta': '审查 Prompt 版本',
    'home.module.runs.description':
      '复盘 Prompt 快照，追溯模板版本，并在调试台中重新使用已保存的变量。',
    'home.module.runs.meta': '浏览 Prompt 快照',
    'home.module.json.description': '格式化、校验、压缩和整理 JSON 数据。',
    'home.module.json.meta': '检查结构化数据',
    'home.module.api.description':
      '组合请求地址、请求头、查询参数和请求体，并生成 fetch 或 cURL 示例。',
    'home.module.api.meta': '草拟请求配置',
    'home.module.code.title': '代码输出查看器',
    'home.module.code.description': '使用单栏或对比模式检查代码和文本输出。',
    'home.module.code.meta': '审查生成结果',
    'home.module.action': '查看模块',
    'home.pattern.eyebrow': '使用方式',
    'home.pattern.title': '保持简单：组合 Prompt、复盘快照并保存有用上下文。',
    'home.pattern.templateTitle': '从 Prompt 模板开始',
    'home.pattern.templateDescription': '选择现有模板，或为重复开发任务创建一个模板。',
    'home.pattern.composeTitle': '组合 Prompt',
    'home.pattern.composeDescription': '填写模板变量并检查最终的 System Prompt 和 User Prompt。',
    'home.pattern.reviewTitle': '复盘并复用快照',
    'home.pattern.reviewDescription': '保存快照、补充复盘信息，或在下一轮重新使用变量。',
    'home.cases.eyebrow': '常见使用场景',
    'home.cases.title': '当前版本已经支持这些小型开发任务。',
    'home.cases.label': '常见使用场景',
    'home.case.codeReview': '准备代码审查',
    'home.case.apiDesign': '辅助 API 设计',
    'home.case.bugTriage': 'Bug 分类与调试',
    'home.case.standardization': '团队 Prompt 标准化',
    'home.case.json': '校验 JSON 数据',
    'home.case.requests': '搭建前后端请求示例',
    'home.case.output': '比较生成代码或改写结果',
    'home.case.revisions': '分享模板前检查 Prompt 版本',
    'home.activity.eyebrow': '最近活动',
    'home.activity.title': '返回工作区时，最近的 Prompt 快照仍会保留。',
    'home.activity.runMeta': 'Prompt 运行记录',
    'home.activity.runDescription.one': '保存自模板版本 v{version}，包含 {count} 个变量。',
    'home.activity.runDescription.other': '保存自模板版本 v{version}，包含 {count} 个变量。',
    'home.activity.open': '打开运行详情',
    'home.activity.emptyTitle': '还没有活动记录',
    'home.activity.emptyDescription': '在调试台中保存 Prompt 快照后，它会出现在这里供以后复盘。',
    'home.direction.eyebrow': '当前方向',
    'home.direction.title': '先完善本地 Prompt 工作流，再考虑更广泛的平台能力。',
    'home.direction.stage': '阶段 {number}',
    'home.direction.foundationTitle': 'Prompt 工作流基础',
    'home.direction.foundationSummary': '保持模板、调试台、快照和运行复盘路径清晰可靠。',
    'home.direction.reliabilityTitle': '复盘与数据可靠性',
    'home.direction.reliabilitySummary': '改进快照复盘、本地校验、备份安全和浏览器测试。',
    'home.direction.connectionsTitle': '聚焦的工具衔接',
    'home.direction.connectionsSummary': '只在确实有助于完成 Prompt 工作流时连接辅助工具。',
    ...promptTemplateTranslations['zh-CN'],
    ...promptPlaygroundTranslations['zh-CN'],
    ...promptRunTranslations['zh-CN'],
    ...promptDiffTranslations['zh-CN'],
  },
} as const;

export type AppLanguage = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];
export type TranslationValues = Record<string, string | number>;

export function translate(
  language: AppLanguage,
  key: TranslationKey,
  values: TranslationValues = {},
) {
  const template = translations[language][key];

  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template as string,
  );
}
