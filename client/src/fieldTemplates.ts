import { FieldTemplate } from './types';

export const FIELD_TEMPLATES: FieldTemplate[] = [
  // 1. Basic Text Inputs
  {
    type: 'text',
    category: 'text',
    name: 'Single-Line Text',
    icon: 'text',
    description: 'Short responses like names, titles, or short text.',
    defaultLabel: 'Full Name',
    defaultPlaceholder: 'e.g. Alex Morgan'
  },
  {
    type: 'textarea',
    category: 'text',
    name: 'Multi-Line Text',
    icon: 'textarea',
    description: 'Longer responses like feedback, notes, or descriptions.',
    defaultLabel: 'Detailed Feedback',
    defaultPlaceholder: 'Type your response here...'
  },
  {
    type: 'password',
    category: 'text',
    name: 'Password',
    icon: 'password',
    description: 'Obscures entered characters for security.',
    defaultLabel: 'Account Password',
    defaultPlaceholder: '••••••••'
  },
  {
    type: 'email',
    category: 'text',
    name: 'Email Address',
    icon: 'email',
    description: 'Validates standard email format on mobile & desktop.',
    defaultLabel: 'Email Address',
    defaultPlaceholder: 'alex@example.com'
  },
  {
    type: 'number',
    category: 'text',
    name: 'Number Input',
    icon: 'number',
    description: 'Numeric inputs with min/max or step counters.',
    defaultLabel: 'Age / Quantity',
    defaultPlaceholder: '0',
    defaultConfig: { min: 0, max: 100 }
  },
  {
    type: 'tel',
    category: 'text',
    name: 'Telephone Number',
    icon: 'tel',
    description: 'Optimized for phone entry with dial pad keyboard.',
    defaultLabel: 'Phone Number',
    defaultPlaceholder: '+1 (555) 000-0000'
  },
  {
    type: 'url',
    category: 'text',
    name: 'Web URL',
    icon: 'url',
    description: 'Designed for website links with format validation.',
    defaultLabel: 'Website / Portfolio Link',
    defaultPlaceholder: 'https://example.com'
  },

  // 2. Selection Inputs
  {
    type: 'radio',
    category: 'choice',
    name: 'Radio Buttons',
    icon: 'radio',
    description: 'Single selection from a small, visible group.',
    defaultLabel: 'Select One Option',
    defaultOptions: ['Option 1', 'Option 2', 'Option 3']
  },
  {
    type: 'checkbox',
    category: 'choice',
    name: 'Checkboxes',
    icon: 'checkbox',
    description: 'Multiple selection options.',
    defaultLabel: 'Select All That Apply',
    defaultOptions: ['Choice A', 'Choice B', 'Choice C']
  },
  {
    type: 'select',
    category: 'choice',
    name: 'Dropdown Menu',
    icon: 'select',
    description: 'Collapsible list for single option selection.',
    defaultLabel: 'Choose Category',
    defaultOptions: ['Category 1', 'Category 2', 'Category 3']
  },
  {
    type: 'toggle',
    category: 'choice',
    name: 'Toggle Switch',
    icon: 'toggle',
    description: 'Modern visual binary Yes/No setting switch.',
    defaultLabel: 'Enable Notifications',
    defaultConfig: { defaultValue: false }
  },

  // 3. Date, Time & Pickers
  {
    type: 'date',
    category: 'datetime',
    name: 'Date Picker',
    icon: 'date',
    description: 'Calendar picker to select day, month, and year.',
    defaultLabel: 'Select Date'
  },
  {
    type: 'time',
    category: 'datetime',
    name: 'Time Picker',
    icon: 'time',
    description: 'Clock picker to choose hours and minutes.',
    defaultLabel: 'Select Time'
  },
  {
    type: 'datetime-local',
    category: 'datetime',
    name: 'Date & Time',
    icon: 'datetime',
    description: 'Combines calendar and clock pickers.',
    defaultLabel: 'Appointment Date & Time'
  },
  {
    type: 'color',
    category: 'datetime',
    name: 'Color Picker',
    icon: 'color',
    description: 'Interactive visual color swatch picker.',
    defaultLabel: 'Preferred Theme Color',
    defaultConfig: { defaultValue: '#0d9488' }
  },

  // 4. Special & Advanced Inputs
  {
    type: 'file',
    category: 'special',
    name: 'File Upload',
    icon: 'file',
    description: 'Allows users to select and upload documents or images.',
    defaultLabel: 'Upload Document / Image'
  },
  {
    type: 'range',
    category: 'special',
    name: 'Range Slider',
    icon: 'range',
    description: 'Draggable slider to pick a bounded numeric value.',
    defaultLabel: 'Satisfaction Rating (1-10)',
    defaultConfig: { min: 1, max: 10, step: 1, defaultValue: 5 }
  },
  {
    type: 'search',
    category: 'special',
    name: 'Search Bar',
    icon: 'search',
    description: 'Search field with clear button.',
    defaultLabel: 'Search Query',
    defaultPlaceholder: 'Search...'
  }
];
