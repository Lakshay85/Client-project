import { FormField } from './types';

export interface DefaultFormTemplate {
  id: string;
  title: string;
  category: 'Feedback' | 'Events' | 'HR' | 'Contact' | 'Product';
  badge: string;
  description: string;
  icon: string;
  fields: FormField[];
}

const RAW_TEMPLATES = [
  {
    id: 'customer-feedback',
    title: 'Customer Feedback & Satisfaction Survey',
    category: 'Feedback' as const,
    badge: 'Popular',
    description: 'Gather actionable feedback, Net Promoter Score (NPS), and improvement suggestions from your clients.',
    icon: 'chart',
    fields: [
      {
        label: 'Overall Satisfaction Level',
        fieldType: 'select' as const,
        isRequired: true,
        options: ['5 - Extremely Satisfied', '4 - Satisfied', '3 - Neutral', '2 - Dissatisfied', '1 - Very Dissatisfied'],
        helpText: 'Select the option that best reflects your experience.',
        sortOrder: 0
      },
      {
        label: 'Respondent Full Name',
        fieldType: 'text' as const,
        placeholder: 'Jane Doe',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Email Address',
        fieldType: 'email' as const,
        placeholder: 'jane.doe@example.com',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Would you recommend us to a colleague?',
        fieldType: 'radio' as const,
        isRequired: true,
        options: ['Definitely Yes', 'Probably', 'Unlikely', 'No'],
        sortOrder: 3
      },
      {
        label: 'Detailed Feedback & Suggestions',
        fieldType: 'textarea' as const,
        placeholder: 'What can we do to make your experience even better?',
        isRequired: false,
        sortOrder: 4
      }
    ]
  },
  {
    id: 'event-registration',
    title: 'Event & Conference Registration Form',
    category: 'Events' as const,
    badge: 'Event Ready',
    description: 'Collect attendee details, ticket tier selections, dietary preferences, and event attendance dates.',
    icon: 'date',
    fields: [
      {
        label: 'Attendee Full Name',
        fieldType: 'text' as const,
        placeholder: 'Alex Smith',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Work Email Address',
        fieldType: 'email' as const,
        placeholder: 'alex.smith@company.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Contact Phone Number',
        fieldType: 'tel' as const,
        placeholder: '+1 (555) 019-2834',
        isRequired: true,
        sortOrder: 2
      },
      {
        label: 'Ticket Tier',
        fieldType: 'select' as const,
        isRequired: true,
        options: ['VIP All-Access Pass ($299)', 'General Admission ($99)', 'Virtual Stream Pass (Free)'],
        sortOrder: 3
      },
      {
        label: 'Preferred Attendance Date',
        fieldType: 'date' as const,
        isRequired: true,
        sortOrder: 4
      },
      {
        label: 'Special Dietary or Accessibility Requirements',
        fieldType: 'textarea' as const,
        placeholder: 'e.g. Vegetarian, Gluten-free, Wheelchair access needed',
        isRequired: false,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'job-application',
    title: 'Job Application & Candidate Profile',
    category: 'HR' as const,
    badge: 'Recruitment',
    description: 'Streamline job candidate submissions with portfolio links, experience details, and cover letters.',
    icon: 'textarea',
    fields: [
      {
        label: 'Applicant Full Name',
        fieldType: 'text' as const,
        placeholder: 'Michael Scott',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Email Address',
        fieldType: 'email' as const,
        placeholder: 'michael@example.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Position Applied For',
        fieldType: 'select' as const,
        isRequired: true,
        options: ['Senior Frontend Developer', 'Backend Systems Engineer', 'UI/UX Product Designer', 'Technical Product Manager'],
        sortOrder: 2
      },
      {
        label: 'Years of Professional Experience',
        fieldType: 'number' as const,
        placeholder: '5',
        isRequired: true,
        sortOrder: 3
      },
      {
        label: 'LinkedIn or Portfolio URL',
        fieldType: 'url' as const,
        placeholder: 'https://linkedin.com/in/yourprofile',
        isRequired: true,
        sortOrder: 4
      },
      {
        label: 'Cover Letter & Summary',
        fieldType: 'textarea' as const,
        placeholder: 'Introduce yourself and share why you are excited about this role...',
        isRequired: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'contact-support',
    title: 'Contact Us & Customer Support Inquiry',
    category: 'Contact' as const,
    badge: 'Essential',
    description: 'A clean contact form for visitors to reach out regarding sales queries or technical assistance.',
    icon: 'email',
    fields: [
      {
        label: 'Your Name',
        fieldType: 'text' as const,
        placeholder: 'Jordan Reed',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Email Address',
        fieldType: 'email' as const,
        placeholder: 'jordan@company.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        label: 'Inquiry Category',
        fieldType: 'select' as const,
        isRequired: true,
        options: ['General Question', 'Sales & Pricing', 'Technical Support', 'Partnership'],
        sortOrder: 2
      },
      {
        label: 'Subject',
        fieldType: 'text' as const,
        placeholder: 'Brief summary of your message',
        isRequired: true,
        sortOrder: 3
      },
      {
        label: 'Message Details',
        fieldType: 'textarea' as const,
        placeholder: 'Provide detailed information so we can assist you quickly...',
        isRequired: true,
        sortOrder: 4
      }
    ]
  },
  {
    id: 'product-review',
    title: 'Product Experience Review & Rating',
    category: 'Product' as const,
    badge: 'E-commerce',
    description: 'Collect detailed product ratings, feature evaluation, and customer testimonials.',
    icon: 'text',
    fields: [
      {
        label: 'Product / Service Reviewed',
        fieldType: 'text' as const,
        placeholder: 'Form Enclave Studio Pro',
        isRequired: true,
        sortOrder: 0
      },
      {
        label: 'Overall Rating',
        fieldType: 'select' as const,
        isRequired: true,
        options: ['5 Stars - Outstanding', '4 Stars - Very Good', '3 Stars - Average', '2 Stars - Needs Work', '1 Star - Poor'],
        sortOrder: 1
      },
      {
        label: 'What feature did you like most?',
        fieldType: 'textarea' as const,
        placeholder: 'Describe your favorite feature or aspect...',
        isRequired: false,
        sortOrder: 2
      },
      {
        label: 'What can we improve?',
        fieldType: 'textarea' as const,
        placeholder: 'Share any feedback or requested improvements...',
        isRequired: false,
        sortOrder: 3
      }
    ]
  }
];

export function getDefaultFormTemplates(): DefaultFormTemplate[] {
  return RAW_TEMPLATES.map((t) => ({
    ...t,
    fields: t.fields.map((f) => ({ ...f, id: crypto.randomUUID() }))
  }));
}

export const DEFAULT_FORM_TEMPLATES: DefaultFormTemplate[] = new Proxy([] as any, {
  get(_target, prop) {
    const templates = getDefaultFormTemplates();
    const val = Reflect.get(templates, prop);
    return typeof val === 'function' ? val.bind(templates) : val;
  }
});

