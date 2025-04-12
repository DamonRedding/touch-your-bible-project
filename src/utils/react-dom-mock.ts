// Mock implementation of react-dom for React Native
export const createPortal = (children: any) => children;
export const findDOMNode = () => null;
export const flushSync = (fn: Function) => fn();
export const render = () => null;
export const unmountComponentAtNode = () => true;
export const unstable_batchedUpdates = (fn: Function) => fn();
export const version = '18.2.0';
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  Events: [],
  ReactBrowserEventEmitter: {
    isEnabled: () => false,
  },
}; 