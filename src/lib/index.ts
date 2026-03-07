import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const generatePDF = async (elementToPrintId: string) => {
  const element = document.getElementById(elementToPrintId);
  if (!element) {
    throw new Error(`Element with id ${elementToPrintId} not found`);
  }
  const canvas = await html2canvas(element, { scale: 2 });
  const data = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [129, 70],
  });
  const imgProperties = pdf.getImageProperties(data);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

  pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("print.pdf");
};

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Capitalizes the first letter of every word in a string.
 */
export function capitalizeWords(text: string): string {
  if (!text) return text;
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Converts a string to ALL CAPS.
 */
export function uppercaseAll(text: string): string {
  return text.toUpperCase();
}