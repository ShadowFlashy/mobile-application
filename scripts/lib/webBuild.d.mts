// Types of webBuild.mjs for the TypeScript unit tests.
export interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}
export interface Rewrite {
  source: string;
  destination: string;
}
export interface HostConfig {
  headers?: HeaderRule[];
  rewrites?: Rewrite[];
  [key: string]: unknown;
}
export declare const REQUIRED_ROUTES: readonly string[];
export declare const SECURITY_HEADERS: readonly { key: string; value: string }[];
export declare const ALL_SOURCES: { vercel: string; serve: string };
export declare function htmlFileOf(route: string): string;
export declare function buildIdOf(files: readonly string[]): string | undefined;
export declare function buildPrecache(files: readonly string[]): { precache: string[]; missing: string[] };
export declare function scanInlineScripts(html: string): { scripts: string[]; problems: string[] };
export declare const ANY_SUPABASE_HOST: string;
export declare function supabaseHostIn(texts: readonly string[]): string | undefined;
export declare function buildCsp(hashSources: readonly string[], supabaseHost?: string): string;
export declare function finishHostConfig(
  config: HostConfig,
  flavor: 'vercel' | 'serve',
  csp: string,
  files: readonly string[],
): HostConfig & { headers: HeaderRule[]; rewrites: Rewrite[] };
