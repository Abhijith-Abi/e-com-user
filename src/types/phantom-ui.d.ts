declare namespace JSX {
  interface IntrinsicElements {
    'phantom-ui': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        loading?: boolean;
        animation?: 'shimmer' | 'pulse' | 'breathe' | 'solid';
        'shimmer-direction'?: 'ltr' | 'rtl' | 'ttb' | 'btt';
        'shimmer-color'?: string;
        'background-color'?: string;
        duration?: number;
        'fallback-radius'?: number;
        stagger?: number;
        reveal?: number;
        count?: number;
        'count-gap'?: number;
      },
      HTMLElement
    >;
  }
}
