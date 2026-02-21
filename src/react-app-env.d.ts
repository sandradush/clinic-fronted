/// <reference types="react-scripts" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module 'jest-axe' {
  export function axe(container: Element | DocumentFragment): Promise<any>;
  export const toHaveNoViolations: Record<string, (...args: any[]) => any>;
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}
