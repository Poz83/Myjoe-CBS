declare module 'potrace' {
  interface PotraceOptions {
    turdSize?: number;
    turnPolicy?: string;
    alphaMax?: number;
    optCurve?: boolean;
    optTolerance?: number;
    threshold?: number;
    blackOnWhite?: boolean;
    color?: string;
    background?: string;
  }

  type TraceCallback = (err: Error | null, svg: string) => void;

  export function trace(
    image: Buffer | string,
    options: PotraceOptions,
    callback: TraceCallback
  ): void;

  export function trace(
    image: Buffer | string,
    callback: TraceCallback
  ): void;

  export class Potrace {
    constructor(options?: PotraceOptions);
    loadImage(image: Buffer | string, callback: (err: Error | null) => void): void;
    getSVG(): string;
    getPathTag(): string;
    getSymbol(id: string): string;
  }
}
