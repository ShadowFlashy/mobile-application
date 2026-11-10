// Types of swHelpers.mjs for the TypeScript unit tests.
export declare const PHOTO_CACHE: string;
export declare const PHOTO_CACHE_MAX: number;
export declare const ROUTE_TEMPLATES: readonly string[];
export declare function templateKey(pathname: string, templates: readonly string[]): string | undefined;
export declare function isPhotoUrl(url: string): boolean;
export declare function photoCacheKey(url: string): string;
export declare function isStaticAssetPath(pathname: string): boolean;
export declare function isObsoleteCache(name: string, buildId: string): boolean;
export declare function overflowCount(count: number, max: number): number;
