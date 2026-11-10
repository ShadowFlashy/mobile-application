export interface SecretPattern {
  name: string;
  regex: RegExp;
}
export declare const SECRET_PATTERNS: readonly SecretPattern[];
export declare function findSecrets(text: string): string[];
