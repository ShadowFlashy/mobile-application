import { Component, type ReactNode } from 'react';

interface SvgFallbackProps {
  /** Rendered instead of the children when react-native-svg fails on a platform. */
  fallback: ReactNode;
  children: ReactNode;
}

interface SvgFallbackState {
  failed: boolean;
}

/** An error boundary around SVG artwork: if react-native-svg is unavailable, the fallback shows. */
export class SvgFallback extends Component<SvgFallbackProps, SvgFallbackState> {
  state: SvgFallbackState = { failed: false };

  static getDerivedStateFromError(): SvgFallbackState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
