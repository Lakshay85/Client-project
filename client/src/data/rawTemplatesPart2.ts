import { RawTemplate } from './rawTemplatesPart1';

export const RAW_TEMPLATES_PART2: RawTemplate[] = [
  {
    title: 'Lead Generation',
    category: 'Lead Gen',
    badge: 'Sales',
    description: 'Capture high-intent inbound leads with company size, role, and project budget.',
    icon: 'zap',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    iconColor: '#10b981',
    fields: [
      {
        label: 'Full Name',
        fieldType: 'text',
        placeholder: 'Sarah Jenkins',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Work Email',
        fieldType: 'email',
        placeholder: 'sarah@enterprise.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Company Name',
        fieldType: 'text',
        placeholder: 'Acme Corp',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Estimated Budget',
        fieldType: 'select',
        isRequired: true,
        options: ['$1k - $5k / mo', '$5k - $20k / mo', '$20k+ / mo', 'Exploring'],
        sortOrder: 3
      },
      {
        label: 'Project Requirements',
        fieldType: 'textarea',
        placeholder: 'Tell us about your goals...',
        isRequired: false,
        sortOrder: 4
      }
    ]
  },
  {
    title: 'Bug Report',
    category: 'Contact',
    badge: 'Dev Tools',
    description: 'Capture detailed issue descriptions, reproduction steps, browser, and severity levels.',
    icon: 'settings',
    iconBg: 'rgba(99, 102, 241, 0.12)',
    iconColor: '#6366f1',
    fields: [
      {
        label: 'Issue Summary',
        fieldType: 'text',
        placeholder: 'Short description of bug',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Severity Level',
        fieldType: 'select',
        isRequired: true,
        options: ['Critical (App Broken)', 'High (Major Feature)', 'Medium (Minor Bug)', 'Low (Cosmetic)'],
        sortOrder: 1
      },
      {
        label: 'Steps to Reproduce',
        fieldType: 'textarea',
        placeholder: '1. Go to...\n2. Click on...\n3. See error...',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Environment / Browser',
        fieldType: 'text',
        placeholder: 'e.g. Chrome 120 on macOS',
        isRequired: false,
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Feature Request',
    category: 'Product',
    badge: 'Roadmap',
    description: 'Empower users to submit and vote on new ideas and roadmap enhancements.',
    icon: 'sparkles',
    iconBg: 'rgba(236, 72, 153, 0.12)',
    iconColor: '#ec4899',
    fields: [
      {
        label: 'Feature Title',
        fieldType: 'text',
        placeholder: 'What feature would you like to see?',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Problem it solves',
        fieldType: 'textarea',
        placeholder: 'Explain the problem you are experiencing...',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Importance to your workflow',
        fieldType: 'select',
        isRequired: true,
        options: ['Must Have', 'Nice to Have', 'Low Priority'],
        sortOrder: 2
      }
    ]
  },
  {
    title: 'Order & Purchase Request',
    category: 'Product',
    badge: 'Operations',
    description: 'Collect internal purchase requisitions, item quantities, and budget approvals.',
    icon: 'folder',
    iconBg: 'rgba(14, 165, 233, 0.12)',
    iconColor: '#0ea5e9',
    fields: [
      {
        label: 'Item Name / Description',
        fieldType: 'text',
        placeholder: 'Software license or hardware item',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Quantity Needed',
        fieldType: 'number',
        placeholder: '1',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Estimated Cost ($ USD)',
        fieldType: 'number',
        placeholder: '250',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Department',
        fieldType: 'select',
        isRequired: true,
        options: ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations'],
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Client Onboarding',
    category: 'HR',
    badge: 'Clients',
    description: 'Gather project details, brand assets, timeline expectations, and stakeholder contacts.',
    icon: 'users',
    iconBg: 'rgba(168, 85, 247, 0.12)',
    iconColor: '#a855f7',
    fields: [
      {
        label: 'Organization Name',
        fieldType: 'text',
        placeholder: 'Company or Brand Name',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Primary Project Lead Email',
        fieldType: 'email',
        placeholder: 'lead@company.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Target Launch Date',
        fieldType: 'date',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Key Deliverables & Goals',
        fieldType: 'textarea',
        placeholder: 'Outline project scope and requirements...',
        isRequired: true,
        sortOrder: 3
      }
    ]
  },
  {
    title: 'RSVP & Guest List',
    category: 'Events',
    badge: 'Social',
    description: 'Track party RSVPs, plus-one guests, attendance status, and song requests.',
    icon: 'check',
    iconBg: 'rgba(234, 179, 8, 0.12)',
    iconColor: '#eab308',
    fields: [
      {
        label: 'Your Name',
        fieldType: 'text',
        placeholder: 'Alex Morgan',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Will you attend?',
        fieldType: 'radio',
        isRequired: true,
        options: ['Joyfully Accept', 'Regretfully Decline'],
        sortOrder: 1
      },
      {
        label: 'Number of Guests attending (including you)',
        fieldType: 'number',
        placeholder: '1',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Song Request or Note',
        fieldType: 'text',
        placeholder: 'Suggest a song for the DJ',
        isRequired: false,
        sortOrder: 3
      }
    ]
  },
  {
    title: 'Net Promoter Score (NPS)',
    category: 'Surveys',
    badge: 'Metrics',
    description: 'Measure customer loyalty on a 0–10 scale and collect qualitative testimonials.',
    icon: 'trending-up',
    iconBg: 'rgba(20, 184, 166, 0.12)',
    iconColor: '#14b8a6',
    fields: [
      {
        label: 'How likely are you to recommend us? (0 to 10)',
        fieldType: 'select',
        isRequired: true,
        options: ['10 - Extremely Likely', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0 - Not at all likely'],
        sortOrder: 0
      },
      {
        label: 'What is the primary reason for your score?',
        fieldType: 'textarea',
        placeholder: 'Tell us what influenced your rating...',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'May we feature your testimonial publicly?',
        fieldType: 'radio',
        isRequired: false,
        options: ['Yes, feel free', 'No, keep private'],
        sortOrder: 2
      }
    ]
  }
];
