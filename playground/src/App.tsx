import 'semantic-ui-css/semantic.min.css';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import 'react-date-picker/dist/DatePicker.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

// Add some CSS to fix calendar warnings
const calendarStyles = `
  .react-calendar {
    max-height: 300px;
    overflow: hidden;
  }
  .react-calendar__month-view {
    height: auto !important;
  }
  .react-calendar__tile {
    max-height: 40px;
  }
  .react-calendar__viewContainer {
    height: 250px !important;
  }
  .react-calendar__century-view,
  .react-calendar__decade-view,
  .react-calendar__year-view {
    height: 250px !important;
  }
  .react-date-picker__calendar {
    z-index: 4;}
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = calendarStyles;
  document.head.appendChild(styleElement);
}

import { useForm } from 'react-hook-form';
import {
  Button,
  Checkbox,
  Container,
  Divider,
  Form,
  Header,
  Input,
  Segment,
} from 'semantic-ui-react';

import { HookFormCheckbox } from '../../src/components/HookFormCheckbox';
import { HookFormDatePicker } from '../../src/components/HookFormDatePicker';
import { HookFormDateRangePicker } from '../../src/components/HookFormDateRangePicker';
import { HookFormField } from '../../src/components/HookFormField';
import { HookFormJsonEditor } from '../../src/components/HookFormJsonEditor';
import { HookFormMenu } from '../../src/components/HookFormMenu';
import { HookFormNumeric } from '../../src/components/HookFormNumeric';
import { HookFormPhone } from '../../src/components/HookFormPhone';
import { HookFormSort } from '../../src/components/HookFormSort';
import { HookFormWysiwygEditor } from '../../src/components/HookFormWysiwygEditor';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  isSubscribed: boolean;
  age: number;
  phone: string;
  birthDate: Date;
  dateRange: { start: Date; end: Date };
  favoriteColor: string;
  priorities: string[];
  config: object;
  description: string;
  content: string;
  jsonData: any;
  newsletter: boolean;
  terms: boolean;
}

export default function App() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
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
      config: {},
      description: '',
      content: '',
      jsonData: { example: 'data' },
      newsletter: false,
      terms: false,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    alert(
      `Form submitted! Check console for details.\n\nData: ${JSON.stringify(data, null, 2)}`,
    );
  };

  return (
    <Container style={{ padding: 24 }}>
      <Header as="h1">Hook Form Semantic Playground</Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Segment>
          <Header as="h2">HookFormField Demo</Header>

          <HookFormField<FormData, { value: string }>
            hookName="firstName"
            hookControl={control}
            hookRules={{ required: 'First name is required' }}
            label="First Name"
          >
            <Input placeholder="Enter your first name" />
          </HookFormField>

          <HookFormField<FormData, { value: string }>
            hookName="lastName"
            hookControl={control}
            hookRules={{ required: 'Last name is required' }}
            label="Last Name"
          >
            <Input placeholder="Enter your last name" />
          </HookFormField>

          <HookFormField<FormData, { value: string }>
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
          >
            <Input placeholder="Enter your email" type="email" />
          </HookFormField>

          <HookFormField<FormData, { checked: boolean }>
            hookName="isSubscribed"
            hookControl={control}
            label="Subscribe to newsletter"
          >
            <Checkbox />
          </HookFormField>
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormCheckbox Demo</Header>

          <HookFormCheckbox<FormData>
            hookName="newsletter"
            hookControl={control}
            label="Newsletter Preferences"
            checkLabel="Subscribe to newsletter"
          />

          <HookFormCheckbox<FormData>
            hookName="terms"
            hookControl={control}
            hookRules={{ required: 'You must accept the terms' }}
            label="Terms and Conditions"
            checkLabel="I accept the terms and conditions"
          />
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormNumeric Demo</Header>

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
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormPhone Demo</Header>

          <HookFormPhone<FormData>
            hookName="phone"
            hookControl={control}
            hookRules={{ required: 'Phone number is required' }}
            label="Phone Number"
            phoneDefaultCountry="us"
          />
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormDatePicker Demo</Header>

          <HookFormDatePicker<FormData>
            hookName="birthDate"
            hookControl={control}
            hookRules={{ required: 'Birth date is required' }}
            label="Birth Date"
          />
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormDateRangePicker Demo</Header>

          <HookFormDateRangePicker<FormData>
            hookName="dateRange"
            hookControl={control}
            label="Date Range"
          />
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormMenu Demo</Header>

          <HookFormMenu<FormData>
            hookName="favoriteColor"
            hookControl={control}
            hookRules={{ required: 'Please select a color' }}
            label="Favorite Color"
            menuOptions={[
              { key: 'red', text: 'Red', value: 'red' },
              { key: 'blue', text: 'Blue', value: 'blue' },
              { key: 'green', text: 'Green', value: 'green' },
              { key: 'yellow', text: 'Yellow', value: 'yellow' },
              { key: 'purple', text: 'Purple', value: 'purple' },
            ]}
            menuPlaceholder="Select your favorite color"
          />
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormSort Demo</Header>

          <HookFormSort<FormData>
            hookName="priorities"
            hookControl={control}
            label="Priority List (drag to reorder)"
            sortOptions={[
              { key: 'work', text: 'Work', value: 'work' },
              { key: 'family', text: 'Family', value: 'family' },
              { key: 'health', text: 'Health', value: 'health' },
              { key: 'hobbies', text: 'Hobbies', value: 'hobbies' },
              { key: 'travel', text: 'Travel', value: 'travel' },
            ]}
          />
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormWysiwygEditor Demo</Header>

          <HookFormWysiwygEditor<FormData>
            hookName="content"
            hookControl={control}
            label="Rich Text Content"
            placeholder="Enter rich text content here..."
          />
        </Segment>

        <Divider />

        <Segment>
          <Header as="h2">HookFormJsonEditor Demo</Header>

          <HookFormJsonEditor<FormData>
            hookName="jsonData"
            hookControl={control}
            label="JSON Data"
            jsonMainMenuBar={false}
            jsonMode="text"
          />
        </Segment>

        <Divider />

        <Button type="submit" primary size="large">
          Submit Form
        </Button>
      </Form>
    </Container>
  );
}
