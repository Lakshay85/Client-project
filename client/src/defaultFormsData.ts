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

export const DEFAULT_FORM_TEMPLATES: DefaultFormTemplate[] = [
  {
    id: 'customer-feedback',
    title: 'Customer Feedback & Satisfaction Survey',
    category: 'Feedback',
    badge: 'Popular',
    description: 'Gather actionable feedback, Net Promoter Score (NPS), and improvement suggestions from your clients.',
    icon: 'chart',
    fields: [
      {
        id: crypto.randomUUID(),
        label: 'Overall Satisfaction Level',
        fieldType: 'select',
        isRequired: true,
        options: ['5 - Extremely Satisfied', '4 - Satisfied', '3 - Neutral', '2 - Dissatisfied', '1 - Very Dissatisfied'],
        helpText: 'Select the option that best reflects your experience.',
        sortOrder: 0
      },
      {
        id: crypto.randomUUID(),
        label: 'Respondent Full Name',
        fieldType: 'text',
        placeholder: 'Jane Doe',
        isRequired: true,
        sortOrder: 1
      },
      {
        id: crypto.randomUUID(),
        label: 'Email Address',
        fieldType: 'email',
        placeholder: 'jane.doe@example.com',
        isRequired: true,
        sortOrder: 2
      },
      {
        id: crypto.randomUUID(),
        label: 'Would you recommend us to a colleague?',
        fieldType: 'radio',
        isRequired: true,
        options: ['Definitely Yes', 'Probably', 'Unlikely', 'No'],
        sortOrder: 3
      },
      {
        id: crypto.randomUUID(),
        label: 'Detailed Feedback & Suggestions',
        fieldType: 'textarea',
        placeholder: 'What can we do to make your experience even better?',
        isRequired: false,
        sortOrder: 4
      }
    ]
  },
  {
    id: 'event-registration',
    title: 'Event & Conference Registration Form',
    category: 'Events',
    badge: 'Event Ready',
    description: 'Collect attendee details, ticket tier selections, dietary preferences, and event attendance dates.',
    icon: 'date',
    fields: [
      {
        id: crypto.randomUUID(),
        label: 'Attendee Full Name',
        fieldType: 'text',
        placeholder: 'Alex Smith',
        isRequired: true,
        sortOrder: 0
      },
      {
        id: crypto.randomUUID(),
        label: 'Work Email Address',
        fieldType: 'email',
        placeholder: 'alex.smith@company.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        id: crypto.randomUUID(),
        label: 'Contact Phone Number',
        fieldType: 'tel',
        placeholder: '+1 (555) 019-2834',
        isRequired: true,
        sortOrder: 2
      },
      {
        id: crypto.randomUUID(),
        label: 'Ticket Tier',
        fieldType: 'select',
        isRequired: true,
        options: ['VIP All-Access Pass ($299)', 'General Admission ($99)', 'Virtual Stream Pass (Free)'],
        sortOrder: 3
      },
      {
        id: crypto.randomUUID(),
        label: 'Preferred Attendance Date',
        fieldType: 'date',
        isRequired: true,
        sortOrder: 4
      },
      {
        id: crypto.randomUUID(),
        label: 'Special Dietary or Accessibility Requirements',
        fieldType: 'textarea',
        placeholder: 'e.g. Vegetarian, Gluten-free, Wheelchair access needed',
        isRequired: false,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'job-application',
    title: 'Job Application & Candidate Profile',
    category: 'HR',
    badge: 'Recruitment',
    description: 'Streamline job candidate submissions with portfolio links, experience details, and cover letters.',
    icon: 'textarea',
    fields: [
      {
        id: crypto.randomUUID(),
        label: 'Applicant Full Name',
        fieldType: 'text',
        placeholder: 'Michael Scott',
        isRequired: true,
        sortOrder: 0
      },
      {
        id: crypto.randomUUID(),
        label: 'Email Address',
        fieldType: 'email',
        placeholder: 'michael@example.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        id: crypto.randomUUID(),
        label: 'Position Applied For',
        fieldType: 'select',
        isRequired: true,
        options: ['Senior Frontend Developer', 'Backend Systems Engineer', 'UI/UX Product Designer', 'Technical Product Manager'],
        sortOrder: 2
      },
      {
        id: crypto.randomUUID(),
        label: 'Years of Professional Experience',
        fieldType: 'number',
        placeholder: '5',
        isRequired: true,
        sortOrder: 3
      },
      {
        id: crypto.randomUUID(),
        label: 'LinkedIn or Portfolio URL',
        fieldType: 'url',
        placeholder: 'https://linkedin.com/in/yourprofile',
        isRequired: true,
        sortOrder: 4
      },
      {
        id: crypto.randomUUID(),
        label: 'Cover Letter & Summary',
        fieldType: 'textarea',
        placeholder: 'Introduce yourself and share why you are excited about this role...',
        isRequired: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'contact-support',
    title: 'Contact Us & Customer Support Inquiry',
    category: 'Contact',
    badge: 'Essential',
    description: 'A clean contact form for visitors to reach out regarding sales queries or technical assistance.',
    icon: 'email',
    fields: [
      {
        id: crypto.randomUUID(),
        label: 'Your Name',
        fieldType: 'text',
        placeholder: 'Jordan Reed',
        isRequired: true,
        sortOrder: 0
      },
      {
        id: crypto.randomUUID(),
        label: 'Email Address',
        fieldType: 'email',
        placeholder: 'jordan@company.com',
        isRequired: true,
        sortOrder: 1
      },
      {
        id: crypto.randomUUID(),
        label: 'Inquiry Category',
        fieldType: 'select',
        isRequired: true,
        options: ['General Question', 'Sales & Pricing', 'Technical Support', 'Partnership'],
        sortOrder: 2
      },
      {
        id: crypto.randomUUID(),
        label: 'Subject',
        fieldType: 'text',
        placeholder: 'Brief summary of your message',
        isRequired: true,
        sortOrder: 3
      },
      {
        id: crypto.randomUUID(),
        label: 'Message Details',
        fieldType: 'textarea',
        placeholder: 'Provide detailed information so we can assist you quickly...',
        isRequired: true,
        sortOrder: 4
      }
    ]
  },
  {
    id: 'product-review',
    title: 'Product Experience Review & Rating',
    category: 'Product',
    badge: 'E-commerce',
    description: 'Collect detailed product ratings, feature evaluation, and customer testimonials.',
    icon: 'text',
    fields: [
      {
        id: crypto.randomUUID(),
        label: 'Product / Service Reviewed',
        fieldType: 'text',
        placeholder: 'Form Enclave Studio Pro',
        isRequired: true,
        sortOrder: 0
      },
      {
        id: crypto.randomUUID(),
        label: 'Overall Rating',
        fieldType: 'select',
        isRequired: true,
        options: ['⭐⭐⭐⭐⭐ 5 Stars - Outstanding', '⭐⭐⭐⭐ 4 Stars - Very Good', '⭐⭐⭐ 3 Stars - Average', '⭐⭐ 2 Stars - Needs Work', '⭐ 1 Star - Poor'],
        sortOrder: 1
      },
      {
        id: crypto.randomUUID(),
        label: 'What feature did you like most?',
        fieldType: 'textarea',
        placeholder: 'Describe your favorite feature or aspect...',
        isRequired: false,
        sortOrder: 2
      },
      {
        id: crypto.randomUUID(),
        label: 'What can we improve?',
        fieldType: 'textarea',
        placeholder: 'Share any feedback or requested improvements...',
        isRequired: false,
        sortOrder: 3
      }
    ]
  }
];
