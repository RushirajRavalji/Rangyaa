declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    text(text: string, x: number, y: number): this;
    setFontSize(size: number): this;
    save(filename: string): void;
    autoTable(options: any): this;
  }

  export default jsPDF;
}

declare module 'jspdf-autotable' {
  export default function autoTable(doc: any, options: any): any;
} 