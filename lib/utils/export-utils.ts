import { exportToSvg } from './svg/export';
import { toast } from 'sonner';
import { extractGradient, convertToSvgGradient } from './gradient/convert';
import { defaultSyntaxTheme } from './syntax/theme';

export async function handleExport(
  elementId: string,
  format: 'svg' | 'png' = 'svg'
): Promise<void> {
  try {
    const previewContainer = document.getElementById('preview-main');
    if (!previewContainer) {
      throw new Error('Preview container not found');
    }

    const codeElement = previewContainer.querySelector('.cm-content');
    if (!codeElement) {
      throw new Error('Code content not found');
    }

    const code = Array.from(codeElement.querySelectorAll('.cm-line'))
      .map(line => line.textContent || '')
      .join('\n');

    const rect = previewContainer.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    const tailwindGradient = extractGradient(previewContainer);
    const gradient = tailwindGradient ? convertToSvgGradient(tailwindGradient) : undefined;

    const svg = exportToSvg(previewContainer, {
      code,
      dimensions: { width, height },
      theme: {
        background: '#282c34',
        text: '#abb2bf',
        lineNumbers: '#495162',
        syntax: defaultSyntaxTheme
      },
      gradient,
      windowControls: true
    });

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Code exported successfully!');
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export code');
    throw error;
  }
}