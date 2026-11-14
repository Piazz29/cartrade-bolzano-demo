// Tipi minimi per il pacchetto `qrcode` (usiamo solo toString in SVG): evita una dipendenza @types in più.
declare module 'qrcode' {
  interface QRCodeToStringOptions {
    type?: 'svg' | 'utf8' | 'terminal';
    margin?: number;
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: { dark?: string; light?: string };
  }
  export function toString(text: string, options?: QRCodeToStringOptions): Promise<string>;
  const QRCode: { toString: typeof toString };
  export default QRCode;
}
