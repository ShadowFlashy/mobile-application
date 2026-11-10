import { Platform, type ViewProps } from 'react-native';

/**
 * Web: react-native-web activates a Pressable with Space only for buttons. Switches, radios,
 * checkboxes and tabs get the same keyboard behaviour as a native control with this handler
 * (Space runs the action instead of scrolling the page). Native ignores it.
 */
export function spaceKey(action: () => void, disabled = false): Pick<ViewProps, 'onKeyDown'> {
  if (Platform.OS !== 'web') return {};
  return {
    onKeyDown: (event) => {
      if (event.key !== ' ' || disabled) return;
      event.preventDefault();
      action();
    },
  };
}
