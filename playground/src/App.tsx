import 'semantic-ui-css/semantic.min.css';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import 'react-date-picker/dist/DatePicker.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

import { useForm } from 'react-hook-form';
import {
  Button,
  Checkbox,
  Container,
  Divider,
  Form,
  Header,
  Input,
} from 'semantic-ui-react';
import { Mode } from 'vanilla-jsoneditor';

import { HookFormDatePicker } from '../../src/components/HookFormDatePicker';
import { HookFormDateRangePicker } from '../../src/components/HookFormDateRangePicker';
import { HookFormField } from '../../src/components/HookFormField';
import { HookFormJsonEditor } from '../../src/components/HookFormJsonEditor';
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
  jsonData: object;
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

        <Form.Group widths="equal">
          <HookFormDatePicker<FormData>
            hookName="birthDate"
            hookControl={control}
            hookRules={{ required: 'Birth date is required' }}
            label="Birth Date"
          />
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
        </Form.Group>

        <Divider />

        <Header as="h2">HookFormWysiwygEditor Demo</Header>

        <Form.Group widths="equal">
          <HookFormWysiwygEditor<FormData>
            hookName="content"
            hookControl={control}
            label="Rich Text Content"
            placeholder="Enter rich text content here..."
            height={200}
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
            jsonMode={Mode.text}
          />
        </Form.Group>

        <Divider />

        <Button type="submit" primary size="large">
          Submit Form
        </Button>
      </Form>
    </Container>
  );
}
