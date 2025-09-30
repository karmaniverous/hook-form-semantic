import type { UseRRStackOutput } from '@karmaniverous/rrstack/react';
import { useEffect, useMemo, useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import {
  Container,
  Dropdown,
  Form,
  Grid,
  Header,
  Input,
  Segment,
} from 'semantic-ui-react';

import { HookFormDatePicker } from '@/components/HookFormDatePicker';
import { HookFormField } from '@/components/HookFormField';
import { HookFormNumeric } from '@/components/HookFormNumeric';

import { checkIfDesktop } from './checkIfDesktop';
import { InfoLabel } from './InfoLabel';

const FREQUENCY_OPTIONS = [
  { key: 'span', text: 'Span', value: 'span' },
  { key: 'yearly', text: 'Yearly', value: 'yearly' },
  { key: 'monthly', text: 'Monthly', value: 'monthly' },
  { key: 'weekly', text: 'Weekly', value: 'weekly' },
  { key: 'daily', text: 'Daily', value: 'daily' },
  { key: 'hourly', text: 'Hourly', value: 'hourly' },
  { key: 'minutely', text: 'Minutely', value: 'minutely' },
  { key: 'secondly', text: 'Secondly', value: 'secondly' },
];
const EFFECT_OPTIONS = [
  { key: 'active', text: 'Active', value: 'active' },
  { key: 'blackout', text: 'Blackout', value: 'blackout' },
];

const WEEKDAY_OPTIONS = [
  { key: 0, text: 'Mon', value: 0 },
  { key: 1, text: 'Tue', value: 1 },
  { key: 2, text: 'Wed', value: 2 },
  { key: 3, text: 'Thu', value: 3 },
  { key: 4, text: 'Fri', value: 4 },
  { key: 5, text: 'Sat', value: 5 },
  { key: 6, text: 'Sun', value: 6 },
];

const POSITION_OPTIONS = [
  { key: 1, text: '1st', value: 1 },
  { key: 2, text: '2nd', value: 2 },
  { key: 3, text: '3rd', value: 3 },
  { key: 4, text: '4th', value: 4 },
  { key: -1, text: 'Last', value: -1 },
];

const MONTH_OPTIONS = [
  { key: 1, text: 'Jan', value: 1 },
  { key: 2, text: 'Feb', value: 2 },
  { key: 3, text: 'Mar', value: 3 },
  { key: 4, text: 'Apr', value: 4 },
  { key: 5, text: 'May', value: 5 },
  { key: 6, text: 'Jun', value: 6 },
  { key: 7, text: 'Jul', value: 7 },
  { key: 8, text: 'Aug', value: 8 },
  { key: 9, text: 'Sep', value: 9 },
  { key: 10, text: 'Oct', value: 10 },
  { key: 11, text: 'Nov', value: 11 },
  { key: 12, text: 'Dec', value: 12 },
];

interface RRStackRuleFormProps<T extends FieldValues = FieldValues> {
  index: number;
  rrstack: UseRRStackOutput['rrstack'];
  hookControl: Control<T>;
  hookNameBase: Path<T>;
}

export const RRStackRuleForm = <T extends FieldValues = FieldValues>({
  index,
  rrstack,
  hookControl,
  hookNameBase,
}: RRStackRuleFormProps<T>) => {
  // Avoid unused param lint error (structural actions are in parent title row)
  void rrstack;
  const rulePath = useMemo(
    () => `${hookNameBase as string}.rules.${index}`,
    [hookNameBase, index],
  );
  const optionsPath = `${rulePath}.options`;
  const durationPath = `${rulePath}.duration`;

  // Desktop breakpoint awareness (kept; used for width tweaks)
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => checkIfDesktop(setIsDesktop), []);

  // Responsive style object that applies maxWidth only on desktop
  const responsiveMaxWidthStyle: React.CSSProperties = useMemo(
    () => (isDesktop ? { maxWidth: '100px' } : {}),
    [isDesktop],
  );

  // NOTE: No direct rrstack writes for normal edits. All fields below write to RHF.
  // rrstack is updated via HookFormRRStack mapping on watch/onChange.

  return (
    <Container>
      {/* Top row: Label, Effect */}
      <Form.Group>
        <HookFormField<T, { value: string }>
          control={Input}
          hookControl={hookControl}
          hookName={`${rulePath}.label` as Path<T>}
          placeholder="Rule label"
          size="small"
          width={12}
          label={
            <InfoLabel
              text="Label"
              help="Optional descriptive name for this rule to help identify its purpose."
            />
          }
        />

        <HookFormField<T, { value: 'active' | 'blackout' }>
          control={Dropdown}
          hookControl={hookControl}
          hookName={`${rulePath}.effect` as Path<T>}
          selection
          compact
          options={EFFECT_OPTIONS}
          width={4}
          label={
            <InfoLabel
              text="Effect"
              help="Active enables windows; Blackout blocks them. Use Blackout to exclude periods."
            />
          }
        />
      </Form.Group>

      {/* Valid Range */}
      <Segment style={{ marginBottom: 0, paddingBottom: 0 }}>
        <Header size="tiny">Valid Range</Header>

        <Form.Group style={{ alignItems: 'flex-end' }}>
          <HookFormDatePicker<T>
            hookControl={hookControl}
            hookName={`${optionsPath}.starts` as Path<T>}
            label="Start Date"
            width={5}
          />

          <HookFormDatePicker<T>
            hookControl={hookControl}
            hookName={`${optionsPath}.ends` as Path<T>}
            label="End Date"
            width={5}
          />

          <HookFormField<T, { value: string }>
            control={Dropdown}
            hookControl={hookControl}
            hookName={`${optionsPath}.freq` as Path<T>}
            selection
            compact
            options={FREQUENCY_OPTIONS}
            style={{ width: '100%', height: '42px' }}
            width={2}
            label={
              <InfoLabel
                text="Frequency"
                help="Span = a continuous time range (no recurrence). Yearly/Monthly/etc. define recurring schedules."
              />
            }
          />

          <HookFormNumeric<T>
            hookControl={hookControl}
            hookName={`${optionsPath}.interval` as Path<T>}
            numericDecimalScale={0}
            width={2}
            label={
              <InfoLabel
                text="Interval"
                help="Number of frequency units to skip between occurrences. Example: every 2 weeks."
              />
            }
          />

          <HookFormNumeric<T>
            hookControl={hookControl}
            hookName={`${optionsPath}.count` as Path<T>}
            numericDecimalScale={0}
            width={2}
            label={
              <InfoLabel
                text="Count"
                help="Maximum number of occurrences to generate for this rule."
              />
            }
          />
        </Form.Group>
      </Segment>

      {/* Recurrence-only constraints (hidden for Span): Months / Weekdays / Time */}
      <Grid columns={3} stackable style={{ margin: 0, padding: 0 }}>
        {/* Months Column */}
        <Grid.Column style={{ paddingLeft: 0 }}>
          <Segment>
            <Header size="tiny">Months</Header>
            <Form.Group widths="equal" style={{ marginBottom: 0 }}>
              <HookFormField<T, { value: number[] }>
                control={Dropdown}
                hookControl={hookControl}
                hookName={`${optionsPath}.bymonth` as Path<T>}
                selection
                multiple
                search
                compact
                options={MONTH_OPTIONS}
                label={
                  <InfoLabel
                    text="Months"
                    help="Restrict recurrences to specific months."
                  />
                }
              />

              <HookFormField<T, { value: string }>
                control={Input}
                hookControl={hookControl}
                hookName={`${optionsPath}.bymonthdayText` as Path<T>}
                placeholder="25 (for 25th)"
                size="small"
                style={responsiveMaxWidthStyle}
                label={
                  <InfoLabel
                    text="DoM"
                    help="Comma-separated days within the month for recurrences (e.g., 1, 15, 31)."
                  />
                }
              />
            </Form.Group>{' '}
          </Segment>
        </Grid.Column>

        {/* Weekdays Column */}
        <Grid.Column style={{ paddingLeft: 0 }}>
          <Segment>
            <Header size="tiny">Weekdays</Header>

            <Form.Group widths="equal" style={{ marginBottom: '-5px' }}>
              <HookFormField<T, { value: number[] }>
                control={Dropdown}
                hookControl={hookControl}
                hookName={`${optionsPath}.byweekday` as Path<T>}
                selection
                multiple
                search
                compact
                options={WEEKDAY_OPTIONS}
                label={
                  <InfoLabel
                    text="Weekdays"
                    help="Select days of the week for recurrences within periods."
                  />
                }
              />

              <HookFormField<T, { value: number[] }>
                control={Dropdown}
                hookControl={hookControl}
                hookName={`${optionsPath}.bysetpos` as Path<T>}
                selection
                multiple
                compact
                options={POSITION_OPTIONS}
                label={
                  <InfoLabel
                    text="Position"
                    help="Select nth occurrence within the period (e.g., 1st, 2nd, Last). Requires weekdays to be selected."
                  />
                }
              />
            </Form.Group>
          </Segment>
        </Grid.Column>

        {/* Time Column */}
        <Grid.Column style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Segment>
            <Header size="tiny">Time</Header>
            <Form.Group widths="equal" style={{ marginBottom: 0 }}>
              <HookFormField<T, { value: string }>
                control={Input}
                hookControl={hookControl}
                hookName={`${optionsPath}.byhourText` as Path<T>}
                placeholder="9, 13, 17"
                size="small"
                style={responsiveMaxWidthStyle}
                label={
                  <InfoLabel
                    text="Hours"
                    help="Comma-separated hours (0–23) when events should occur. Example: 9, 13, 17"
                  />
                }
              />
              <HookFormField<T, { value: string }>
                control={Input}
                hookControl={hookControl}
                hookName={`${optionsPath}.byminuteText` as Path<T>}
                placeholder="0, 30"
                size="small"
                style={responsiveMaxWidthStyle}
                label={
                  <InfoLabel
                    text="Minutes"
                    help="Comma-separated minutes (0–59). Example: 0, 30"
                  />
                }
              />
            </Form.Group>
          </Segment>
        </Grid.Column>
      </Grid>

      {/* Only show duration section for recurring rules */}
      <Segment style={{ marginTop: 0, paddingBottom: 0 }}>
        <Header size="tiny" style={{ marginTop: 0 }}>
          Duration
        </Header>

        <Form.Group widths={6}>
          <HookFormNumeric<T>
            hookControl={hookControl}
            hookName={`${durationPath}.years` as Path<T>}
            numericDecimalScale={0}
            label={
              <InfoLabel text="Years" help="Duration years component (0+)." />
            }
          />

          <HookFormNumeric<T>
            hookControl={hookControl}
            hookName={`${durationPath}.months` as Path<T>}
            numericDecimalScale={0}
            label={
              <InfoLabel text="Months" help="Duration months component (0+)." />
            }
          />

          <HookFormNumeric<T>
            hookControl={hookControl}
            hookName={`${durationPath}.days` as Path<T>}
            numericDecimalScale={0}
            label={
              <InfoLabel text="Days" help="Duration days component (0+)." />
            }
          />

          <HookFormNumeric<T>
            hookControl={hookControl}
            hookName={`${durationPath}.hours` as Path<T>}
            numericDecimalScale={0}
            label={
              <InfoLabel text="Hours" help="Duration hours component (0+)." />
            }
          />

          <HookFormNumeric<T>
            hookControl={hookControl}
            hookName={`${durationPath}.minutes` as Path<T>}
            numericDecimalScale={0}
            label={
              <InfoLabel text="Min" help="Duration minutes component (0+)." />
            }
          />

          <HookFormNumeric<T>
            hookControl={hookControl}
            hookName={`${durationPath}.seconds` as Path<T>}
            numericDecimalScale={0}
            label={
              <InfoLabel text="Sec" help="Duration seconds component (0+)." />
            }
          />
        </Form.Group>
      </Segment>
    </Container>
  );
};
