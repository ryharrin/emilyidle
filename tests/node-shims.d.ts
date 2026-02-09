declare module "node:fs/promises" {
  export type PathLike = string | URL;

  export interface Dirent {
    name: string;
    isFile(): boolean;
    isDirectory(): boolean;
  }

  export function readFile(path: PathLike, encoding: "utf8"): Promise<string>;
  export function writeFile(path: PathLike, data: string, encoding: "utf8"): Promise<void>;
  export function mkdir(
    path: PathLike,
    options?: {
      recursive?: boolean;
    },
  ): Promise<string | undefined>;
  export function rm(
    path: PathLike,
    options?: {
      recursive?: boolean;
      force?: boolean;
    },
  ): Promise<void>;
  export function readdir(
    path: PathLike,
    options: {
      withFileTypes: true;
    },
  ): Promise<Dirent[]>;
}

declare module "node:path" {
  const path: {
    sep: string;
    basename(path: string): string;
    join(...paths: string[]): string;
    relative(from: string, to: string): string;
  };
  export default path;
}
