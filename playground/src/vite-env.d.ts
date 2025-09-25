/// <reference types="vite/client" />

// CSS module declarations
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

declare module '*.less' {
  const content: string;
  export default content;
}

// Specific CSS declarations for third-party packages
declare module 'react-date-picker/dist/DatePicker.css';
declare module 'react-datetime-picker/dist/DateTimePicker.css';
declare module '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
declare module '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css';
declare module 'react-calendar/dist/Calendar.css';
declare module 'react-clock/dist/Clock.css';
declare module 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
declare module 'semantic-ui-css/semantic.min.css';
