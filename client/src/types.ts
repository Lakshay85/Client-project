export type FieldType =
  | 'text'
  | 'textarea'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'toggle'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'color'
  | 'file'
  | 'range'
  | 'search';

export interface FieldConfig {
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  defaultValue?: string | number | boolean;
}

export interface FormField {
  id: string;
  label: string;
  fieldType: FieldType;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  options?: string[];
  config?: FieldConfig;
  sortOrder?: number;
}

export type AccessType = 'allow_all' | 'allow_only' | 'restrict_specific';

export interface Form {
  id: string;
  shareId: string;
  title: string;
  description?: string;
  status: 'published' | 'draft';
  accessType?: AccessType;
  restrictedEmails?: string[];
  isRestricted?: boolean;
  createdAt: string;
  fields?: FormField[];
  responseCount?: number;
  fieldCount?: number;
}

export interface FormSubmission {
  id: string;
  submittedAt: string;
  submitterIp?: string;
  submitterEmail?: string;
  answers: Record<string, string>;
}

export interface FieldTemplate {
  type: FieldType;
  category: 'text' | 'choice' | 'datetime' | 'special';
  name: string;
  icon: string;
  description: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  defaultOptions?: string[];
  defaultConfig?: FieldConfig;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
