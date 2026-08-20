import { FormField } from './types';
import { RawTemplate, RAW_TEMPLATES_PART1 } from './data/rawTemplatesPart1';
import { RAW_TEMPLATES_PART2 } from './data/rawTemplatesPart2';

export type { RawTemplate };

export interface DefaultFormTemplate {
  id: string;
  title: string;
  category: 'Feedback' | 'Events' | 'HR' | 'Contact' | 'Product' | 'Surveys' | 'Lead Gen';
  badge: string;
  description: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  singleSubmissionOnly?: boolean;
  fields: FormField[];
}

const RAW_TEMPLATES: RawTemplate[] = [...RAW_TEMPLATES_PART1, ...RAW_TEMPLATES_PART2];

export function getDefaultFormTemplates(): DefaultFormTemplate[] {
  return RAW_TEMPLATES.map((t) => {
    // Generate deterministic IDs based on title slug
    const id = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
      ...t,
      id,
      singleSubmissionOnly: true,
      fields: t.fields.map((f) => ({ ...f, id: crypto.randomUUID() })),
    };
  });
}

export const DEFAULT_FORM_TEMPLATES: DefaultFormTemplate[] = new Proxy([] as any, {
  get(_target, prop) {
    const templates = getDefaultFormTemplates();
    const val = Reflect.get(templates, prop);
    return typeof val === 'function' ? val.bind(templates) : val;
  },
});
