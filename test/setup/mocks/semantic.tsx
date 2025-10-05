import { vi } from 'vitest';

// semantic-ui-react lightweight doubles (decomposed)
import * as controls from './semantic/controls';

vi.mock('semantic-ui-react', () => controls);
