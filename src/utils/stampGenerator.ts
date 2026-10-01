import { formatDDMMYYYY } from './dateFormatter';

/**
 * Generates an official high-resolution ALBAKSH MOLSAB Stamp PNG Data URL
 * Can be used as a digital signature anywhere signatures are accepted.
 */
export function generateStampSignatureDataUrl(dateInput?: string | Date): string {
  const dateStr = formatDDMMYYYY(dateInput);
  const size = 320;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const center = size / 2;
  const radius = size / 2 - 16;

  // Clear background (transparent)
  ctx.clearRect(0, 0, size, size);

  // Slight ink angle for realistic stamp feel (-3 degrees)
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.translate(-center, -center);

  // Outer dashed circle
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#059669'; // Emerald stamp ink
  ctx.stroke();

  // Inner solid circle
  ctx.beginPath();
  ctx.arc(center, center, radius - 8, 0, 2 * Math.PI);
  ctx.lineWidth = 2.5;
  ctx.setLineDash([]);
  ctx.strokeStyle = '#10b981';
  ctx.stroke();

  // Innermost thin circle
  ctx.beginPath();
  ctx.arc(center, center, radius - 38, 0, 2 * Math.PI);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#059669';
  ctx.stroke();

  // Helper for curved text along circle arc
  const drawCurvedText = (
    text: string,
    r: number,
    startAngle: number,
    endAngle: number,
    fontSize: number,
    isReversed = false
  ) => {
    ctx.save();
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = '#047857';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numChars = text.length;
    const angleStep = (endAngle - startAngle) / (numChars - 1 || 1);

    for (let i = 0; i < numChars; i++) {
      const char = text[i];
      const charAngle = startAngle + i * angleStep;
      ctx.save();
      const x = center + r * Math.cos(charAngle);
      const y = center + r * Math.sin(charAngle);
      ctx.translate(x, y);
      ctx.rotate(charAngle + (isReversed ? -Math.PI / 2 : Math.PI / 2));
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  };

  // Top Curved Text: ★ ALBAKSH MOLSAB ★
  drawCurvedText(
    '★ ALBAKSH MOLSAB ★',
    radius - 23,
    (-140 * Math.PI) / 180,
    (-40 * Math.PI) / 180,
    14
  );

  // Bottom Curved Text: TUITION ACADEMY & REGISTER
  drawCurvedText(
    'STUDENTS REGISTER ACADEMY',
    radius - 23,
    (140 * Math.PI) / 180,
    (40 * Math.PI) / 180,
    11,
    true
  );

  // Center Content:
  // 1. Urdu text: مہرِ تصدیق
  ctx.font = 'bold 22px serif';
  ctx.fillStyle = '#065f46';
  ctx.textAlign = 'center';
  ctx.fillText('مہرِ تصدیق', center, center - 26);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(center - 50, center - 12);
  ctx.lineTo(center + 50, center - 12);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#10b981';
  ctx.stroke();

  // 2. Date in DD.MM.YYYY
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#d97706'; // Amber accent for date
  ctx.fillText(dateStr, center, center + 6);

  // 3. Subtext: VERIFIED & SIGNED
  ctx.font = 'bold 9px sans-serif';
  ctx.fillStyle = '#047857';
  ctx.letterSpacing = '1px';
  ctx.fillText('OFFICIAL SEAL & SIGN', center, center + 22);

  // Small stars or dots
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText('★', center - 60, center);
  ctx.fillText('★', center + 60, center);

  ctx.restore();

  return canvas.toDataURL('image/png');
}
