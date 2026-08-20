import { FormField } from '../types';

export interface RawTemplate {
  title: string;
  category: 'Feedback' | 'Events' | 'HR' | 'Contact' | 'Product' | 'Surveys' | 'Lead Gen';
  badge: string;
  description: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  singleSubmissionOnly?: boolean;
  fields: Omit<FormField, 'id'>[];
}

export const RAW_TEMPLATES_PART1: RawTemplate[] = [
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
  }
];
