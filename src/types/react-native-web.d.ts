// ARIA props that react-native-web 0.19 renders on the DOM but React Native's own types do not list.
// Native ignores them; on native the matching `accessibilityHint` / `accessibilityState` still apply.
import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    /** Web: id of the element that describes this one (its description, hint or error). */
    'aria-describedby'?: string;
    /** Web: the disclosure state of a row that expands (RNW ignores `accessibilityState`). */
    'aria-expanded'?: boolean;
    /** Web: a key pressed while the element has focus (react-native-web forwards it). */
    onKeyDown?: (event: { key: string; preventDefault: () => void }) => void;
  }
  interface TextProps {
    /** Web: the heading level of a header text (h1, h2, …); without it every heading is an h1. */
    'aria-level'?: number;
  }
}
