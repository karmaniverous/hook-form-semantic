import 'semantic-ui-css/semantic.min.css';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import 'react-date-picker/dist/DatePicker.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { useForm } from 'react-hook-form';
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Header,
  Input,
  Segment,
} from 'semantic-ui-react';

import { HookFormDatePicker } from '@/components/HookFormDatePicker';
import { HookFormDateRangePicker } from '@/components/HookFormDateRangePicker';
import { HookFormField } from '@/components/HookFormField';
import { HookFormJsonEditor } from '@/components/HookFormJsonEditor';
import { HookFormNumeric } from '@/components/HookFormNumeric';
import { HookFormPhone } from '@/components/HookFormPhone';
import { HookFormRRStack } from '@/components/HookFormRRStack';
import type { HookFormRRStackData } from '@/components/HookFormRRStack/types';
import { HookFormSort } from '@/components/HookFormSort';
import { HookFormWysiwygEditor } from '@/components/HookFormWysiwygEditor';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  isSubscribed: boolean;
  age: number;
  phone: string;
  birthDate?: Date;
  dateRange?: { start: Date; end: Date };
  favoriteColor: string;
  priorities: string[];
  sortBy: [string, boolean];
  config: object;
  description: string;
  content: string;
  jsonData: object;
  newsletter: boolean;
  terms: boolean;
  rrstack: HookFormRRStackData;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: async () => {
      await sleep(1000);

      return {
        firstName: '',
        lastName: '',
        email: '',
        isSubscribed: false,
        age: 0,
        phone: '',
        birthDate: undefined,
        dateRange: undefined,
        favoriteColor: '',
        priorities: [],
        sortBy: ['name', true],
        config: {},
        description: '',
        content: '',
        jsonData: { example: 'data' },
        newsletter: false,
        terms: false,
        rrstack: {
          rules: [],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    alert(
      `Form submitted! Check console for details.\n\nData: ${JSON.stringify(data, null, 2)}`,
    );
  };

  return (
    <Segment
      style={{
        maxWidth: '800px',
        margin: '24px auto',
        padding: 24,
      }}
    >
      <Header as="h1">Hook Form Semantic Playground</Header>

      <Form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
      >
        <Header as="h2">HookFormField Demo</Header>

        <Form.Group widths="equal">
          <HookFormField<FormData, { value: string }>
            control={Input}
            hookName="firstName"
            hookControl={control}
            hookRules={{ required: 'First name is required' }}
            label="First Name"
            placeholder="Enter your first name"
          />

          <HookFormField<FormData, { value: string }>
            control={Input}
            hookName="lastName"
            hookControl={control}
            hookRules={{ required: 'Last name is required' }}
            label="Last Name"
            placeholder="Enter your last name"
          />
        </Form.Group>

        <Form.Group widths="equal">
          <HookFormField<FormData, { value: string }>
            control={Input}
            hookName="email"
            hookControl={control}
            hookRules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            label="Email"
            placeholder="Enter your email"
          />

          <HookFormField<FormData, { checked: boolean }>
            control={Checkbox}
            hookName="isSubscribed"
            hookControl={control}
            label="Subscribe to newsletter"
            style={{
              alignSelf: 'flex-end',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          />
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormNumeric Demo</Header>

        <Form.Group widths="equal">
          <HookFormNumeric<FormData>
            hookName="age"
            hookControl={control}
            hookRules={{
              required: 'Age is required',
              min: { value: 1, message: 'Age must be at least 1' },
              max: { value: 120, message: 'Age must be less than 120' },
            }}
            label="Age"
            numericAllowNegative={false}
            numericDecimalScale={0}
          />
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormPhone Demo</Header>

        <Form.Group widths="equal">
          <HookFormPhone<FormData>
            hookName="phone"
            hookControl={control}
            hookRules={{ required: 'Phone number is required' }}
            label="Phone Number"
            phoneDefaultCountry="us"
          />
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormDatePicker Demo</Header>

        <Form.Group>
          <Form.Field className="computer eight wide mobile sixteen wide">
            <HookFormDatePicker<FormData>
              hookName="birthDate"
              hookControl={control}
              hookRules={{ required: 'Birth date is required' }}
              label="Birth Date"
            />
          </Form.Field>
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormDateRangePicker Demo</Header>

        <Form.Group widths="equal">
          <HookFormDateRangePicker<FormData>
            hookName="dateRange"
            hookControl={control}
            label="Date Range"
          />
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormSort Demo</Header>

        <Form.Group widths="equal">
          <HookFormSort<FormData>
            hookName="sortBy"
            hookControl={control}
            label="Sort By (field and direction)"
            sortOptions={[
              { key: 'name', text: 'Name', value: 'name' },
              { key: 'date', text: 'Date Created', value: 'date' },
              { key: 'priority', text: 'Priority Level', value: 'priority' },
              { key: 'status', text: 'Status', value: 'status' },
              { key: 'category', text: 'Category', value: 'category' },
            ]}
          />
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormWysiwygEditor Demo</Header>

        <Form.Group widths="equal">
          <HookFormWysiwygEditor<FormData>
            hookName="content"
            hookControl={control}
            label="Rich Text Content"
            placeholder="Enter rich text content here..."
            wysiwygEditorStyle={{
              border: '1px solid #f1f1f1',
              padding: '0 1rem',
              minHeight: '400px', // Add this to make it taller
            }}
          />
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormJsonEditor Demo</Header>

        <Form.Group widths="equal">
          <HookFormJsonEditor<FormData>
            hookName="jsonData"
            hookControl={control}
            label="JSON Data"
            jsonMainMenuBar={false}
          />
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormRRStack Demo</Header>

        <HookFormRRStack<FormData>
          describeBoundsFormat="yyyy-LL-dd"
          describeShowBounds
          describeShowRecurrenceCount
          hookName="rrstack"
          hookControl={control}
          endDatesInclusive
          label="Scheduling Rules"
          logger={console}
        />

        <Divider />

        <Button type="submit" primary size="large">
          Submit Form
        </Button>
      </Form>
    </Segment>
  );
}
