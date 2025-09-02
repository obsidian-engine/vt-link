// Stub for @types/glob compatibility with minimatch
declare module "glob" {
  interface IOptions {
    cwd?: string;
    root?: string;
    dot?: boolean;
    nomount?: boolean;
    mark?: boolean;
    nosort?: boolean;
    stat?: boolean;
    silent?: boolean;
    strict?: boolean;
    cache?: { [path: string]: any };
    statCache?: { [path: string]: any };
    symlinks?: { [path: string]: boolean };
    nounique?: boolean;
    nonull?: boolean;
    debug?: boolean;
    nobrace?: boolean;
    noglobstar?: boolean;
    noext?: boolean;
    nocase?: boolean;
    matchBase?: boolean;
    nodir?: boolean;
    ignore?: string | string[];
    follow?: boolean;
    realpath?: boolean;
    nonegate?: boolean;
    nocomment?: boolean;
    sync?: boolean;
    absolute?: boolean;
  }

  interface IMinimatch {
    pattern: string;
    options: IOptions;
    set: string[][];
    regexp: RegExp | null;
    negate: boolean;
    comment: boolean;
    empty: boolean;
    match(fname: string): boolean;
    makeRe(): RegExp | false;
  }

  function glob(
    pattern: string,
    callback: (err: Error | null, matches: string[]) => void,
  ): void;
  function glob(
    pattern: string,
    options: IOptions,
    callback: (err: Error | null, matches: string[]) => void,
  ): void;

  namespace glob {
    function sync(pattern: string, options?: IOptions): string[];
    const Glob: any;
    const GlobSync: any;
    const hasMagic: (pattern: string, options?: IOptions) => boolean;
    const escape: (s: string) => string;
    const minimatch: typeof IMinimatch;
  }

  export = glob;
}
