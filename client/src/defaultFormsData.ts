import { FormField } from './types';

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

export interface RawTemplate extends Omit<DefaultFormTemplate, 'id' | 'fields'> {
  fields: Omit<FormField, 'id'>[];
}

const RAW_TEMPLATES: RawTemplate[] = [
  {
    title: 'Customer Feedback',
    category: 'Feedback',
    badge: 'Popular',
    description: 'Gather actionable feedback, Net Promoter Score (NPS), and improvement suggestions from your clients.',
    icon: 'chart',
    iconBg: 'rgba(239, 68, 68, 0.12)',
    iconColor: '#ef4444',
    fields: [
      {
        label: 'Overall Satisfaction Level',
        fieldType: 'select',
        isRequired: true,
        options: ['5 - Extremely Satisfied', '4 - Satisfied', '3 - Neutral', '2 - Dissatisfied', '1 - Very Dissatisfied'],
        helpText: 'Select the option that best reflects your experience.',
        sortOrder: 0
      },
      {
        label: 'Respondent Full Name',
        fieldType: 'text',
        placeholder: 'Jane Doe',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Email Address',
        fieldType: 'email',
        placeholder: 'jane.doe@example.com',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Would you recommend us to a colleague?',
        fieldType: 'radio',
        isRequired: true,
        options: ['Definitely Yes', 'Probably', 'Unlikely', 'No'],
        sortOrder: 3
      },
      {
        label: 'Detailed Feedback & Suggestions',
        fieldType: 'textarea',
        placeholder: 'What can we do to make your experience even better?',
        isRequired: false,
        sortOrder: 4
      }
    ]
  },
  {
    title: 'Event Registration',
    category: 'Events',
    badge: 'Event Ready',
    description: 'Collect attendee details, ticket tier selections, dietary preferences, and attendance dates.',
    icon: 'date',
    iconBg: 'rgba(249, 115, 22, 0.12)',
    iconColor: '#f97316',
    fields: [
      {
        label: 'Attendee Full Name',
        fieldType: 'text',
        placeholder: 'Alex Smith',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Work Email Address',
        fieldType: 'email',
        placeholder: 'alex.smith@company.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Contact Phone Number',
        fieldType: 'tel',
        placeholder: '+1 (555) 019-2834',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Ticket Tier',
        fieldType: 'select',
        isRequired: true,
        options: ['VIP All-Access Pass ($299)', 'General Admission ($99)', 'Virtual Stream Pass (Free)'],
        sortOrder: 3
      },
      {
        label: 'Preferred Attendance Date',
        fieldType: 'date',
        isRequired: true,
        sortOrder: 4
      },
      {
        label: 'Special Dietary or Accessibility Requirements',
        fieldType: 'textarea',
        placeholder: 'e.g. Vegetarian, Gluten-free, Wheelchair access needed',
        isRequired: false,
        sortOrder: 5
      }
    ]
  },
  {
    title: 'Job Application',
    category: 'HR',
    badge: 'Recruitment',
    description: 'Streamline job candidate submissions with portfolio links, experience details, and cover letters.',
    icon: 'textarea',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    iconColor: '#10b981',
    fields: [
      {
        label: 'Applicant Full Name',
        fieldType: 'text',
        placeholder: 'Michael Scott',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Email Address',
        fieldType: 'email',
        placeholder: 'michael@example.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Position Applied For',
        fieldType: 'select',
        isRequired: true,
        options: ['Senior Frontend Developer', 'Backend Systems Engineer', 'UI/UX Product Designer', 'Technical Product Manager'],
        sortOrder: 2
      },
      {
        label: 'Years of Professional Experience',
        fieldType: 'number',
        placeholder: '5',
        isRequired: true,
        sortOrder: 3
      },
      {
        label: 'LinkedIn or Portfolio URL',
        fieldType: 'url',
        placeholder: 'https://linkedin.com/in/yourprofile',
        isRequired: true,
        sortOrder: 4
      },
      {
        label: 'Cover Letter & Summary',
        fieldType: 'textarea',
        placeholder: 'Introduce yourself and share why you are excited about this role...',
        isRequired: true,
        sortOrder: 5
      }
    ]
  },
  {
    title: 'Contact & Support',
    category: 'Contact',
    badge: 'Essential',
    description: 'A clean contact form for visitors to reach out regarding sales queries or technical assistance.',
    icon: 'email',
    iconBg: 'rgba(59, 130, 246, 0.12)',
    iconColor: '#3b82f6',
    fields: [
      {
        label: 'Your Name',
        fieldType: 'text',
        placeholder: 'Jordan Reed',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Email Address',
        fieldType: 'email',
        placeholder: 'jordan@company.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Inquiry Category',
        fieldType: 'select',
        isRequired: true,
        options: ['General Question', 'Sales & Pricing', 'Technical Support', 'Partnership'],
        sortOrder: 2
      },
      {
        label: 'Subject',
        fieldType: 'text',
        placeholder: 'Brief summary of your message',
        isRequired: true,
        sortOrder: 3
      },
      {
        label: 'Message Details',
        fieldType: 'textarea',
        placeholder: 'Provide detailed information so we can assist you quickly...',
        isRequired: true,
        sortOrder: 4
      }
    ]
  },
  {
    title: 'Product Review',
    category: 'Product',
    badge: 'E-commerce',
    description: 'Collect detailed product ratings, feature evaluation, and customer testimonials.',
    icon: 'text',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#f59e0b',
    fields: [
      {
        label: 'Product / Service Reviewed',
        fieldType: 'text',
        placeholder: 'Form Enclave Studio Pro',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Overall Rating',
        fieldType: 'select',
        isRequired: true,
        options: ['5 Stars - Outstanding', '4 Stars - Very Good', '3 Stars - Average', '2 Stars - Needs Work', '1 Star - Poor'],
        sortOrder: 1
      },
      {
        label: 'What feature did you like most?',
        fieldType: 'textarea',
        placeholder: 'Describe your favorite feature or aspect...',
        isRequired: false,
        sortOrder: 2
      },
      {
        label: 'What can we improve?',
        fieldType: 'textarea',
        placeholder: 'Share any feedback or requested improvements...',
        isRequired: false,
        sortOrder: 3
      }
    ]
  },
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

export function getDefaultFormTemplates(): DefaultFormTemplate[] {
  return RAW_TEMPLATES.map((t) => {
    // Generate deterministic IDs based on title slug
    const id = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
      ...t,
      id,
      singleSubmissionOnly: true,
      fields: t.fields.map((f) => ({ ...f, id: crypto.randomUUID() }))
    };
  });
}

export const DEFAULT_FORM_TEMPLATES: DefaultFormTemplate[] = new Proxy([] as any, {
  get(_target, prop) {
    const templates = getDefaultFormTemplates();
    const val = Reflect.get(templates, prop);
    return typeof val === 'function' ? val.bind(templates) : val;
  }
});
