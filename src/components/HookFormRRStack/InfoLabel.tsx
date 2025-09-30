import type { SemanticICONS } from 'semantic-ui-react';
import { Icon, Popup } from 'semantic-ui-react';

export interface InfoLabelProps {
  help: string;
  icon?: SemanticICONS | undefined;
  style?: React.CSSProperties;
  text: string;
}

export const InfoLabel: React.FC<InfoLabelProps> = ({
  text,
  help,
  icon = 'info circle',
  style,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}{' '}
    <Popup
      content={help}
      trigger={
        <Icon
          name={icon}
          style={{
            marginLeft: 4,
            marginBottom: 6,
            opacity: 0.6,
            cursor: 'help',
          }}
        />
      }
      position="top center"
      size="small"
      inverted
    />
  </span>
);
