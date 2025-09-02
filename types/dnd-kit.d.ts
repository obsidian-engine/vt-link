// Stub for @dnd-kit JSX namespace compatibility with React 19
declare namespace JSX {
  interface Element extends React.ReactElement<any, any> {}
  interface ElementClass extends React.Component<any> {
    render(): React.ReactNode;
  }
  interface ElementAttributesProperty {
    props: {};
  }
  interface ElementChildrenAttribute {
    children: {};
  }
  interface LibraryManagedAttributes<C, P> extends React.LibraryManagedAttributes<C, P> {}
  interface IntrinsicAttributes extends React.Attributes {}
  interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  interface IntrinsicElements extends React.IntrinsicElements {}
}

// Global React import for @dnd-kit components
/// <reference types="react" />

declare module '@dnd-kit/core' {
  import type * as React from 'react';
  export * from '@dnd-kit/core/dist/index';
}

declare module '@dnd-kit/sortable' {
  import type * as React from 'react';
  export * from '@dnd-kit/sortable/dist/index';
}

declare module '@dnd-kit/utilities' {
  export * from '@dnd-kit/utilities/dist/index';
}

declare module '@dnd-kit/modifiers' {
  export * from '@dnd-kit/modifiers/dist/index';
}
