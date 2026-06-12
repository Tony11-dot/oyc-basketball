declare module "arabic-reshaper" {
  /** Reshape Arabic text to Unicode presentation forms (logical order). */
  export function convertArabic(text: string): string;
  export function convertArabicBack(text: string): string;
  const _default: { convertArabic: typeof convertArabic; convertArabicBack: typeof convertArabicBack };
  export default _default;
}
