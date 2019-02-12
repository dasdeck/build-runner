
declare module 'extglob' {
   export default function (pattern: string, options?: object): string;
   export function capture(pattern: string, target: string, options?: object): string[];
}
