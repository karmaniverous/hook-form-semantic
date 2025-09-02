import 'semantic-ui-css/semantic.min.css';

import { useForm } from 'react-hook-form';
import {
  Button,
  Checkbox,
  Container,
  Form,
  Header,
  Input,
} from 'semantic-ui-react';

import { HelloWorld } from '../../src/components/HelloWorld';
import { HookFormField } from '../../src/components/HookFormField';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  isSubscribed: boolean;
}

export default function App() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      isSubscribed: false,
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

      <HelloWorld who="Developer" />

      <Header as="h2">HookFormField Demo</Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
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

        <Button type="submit" primary>
          Submit Form
        </Button>
      </Form>
    </Container>
  );
}
