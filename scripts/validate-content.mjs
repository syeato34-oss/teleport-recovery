import { configModule } from './config-module.mjs';
const { validateContent } = await import(configModule('src/config/validateContent.ts'));
console.log('Content gate:', JSON.stringify(validateContent()));
