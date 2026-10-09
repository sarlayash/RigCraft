import React, { useRef, useState } from 'react';
import { LearnerProfile, BadgeItem } from '../types/game';
import { GAME_BADGES } from '../data/hardwareData';
import { sounds } from '../utils/soundEffects';
import { jsPDF } from 'jspdf';
import {
  Award,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  FileText,
  Share2,
} from 'lucide-react';

interface BadgesAndCertificateProps {
  profile: LearnerProfile;
  badges: BadgeItem[];
}

export const BadgesAndCertificate: React.FC<BadgesAndCertificateProps> = ({
  profile,
  badges,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Generate unique verifiable certificate ID
  const certId = `RC-2026-${profile.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'SYS'}-${(
    (profile.examScore || 85) * 137
  )
    .toString(16)
    .toUpperCase()
    .slice(0, 6)}`;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  /**
   * Generates a 2400x1600 300-DPI crisp Canvas render of the certificate.
   * Completely avoids DOM CSS text-overflow bugs.
   */
  const drawCertificateToCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background Rich Dark Slate / Obsidian Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 2400, 1600);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2400, 1600);

    // Subtle Radial Glow behind Center
    const glowGrad = ctx.createRadialGradient(1200, 700, 50, 1200, 700, 900);
    glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
    glowGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.04)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, 2400, 1600);

    // Double Outer Gold Borders
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(60, 60, 2280, 1480);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(90, 90, 2220, 1420);

    // Corner Ornaments
    const drawCorner = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.lineTo(0, 0);
      ctx.lineTo(40, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(14, 14, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.restore();
    };
    drawCorner(110, 110, 0);
    drawCorner(2290, 110, Math.PI / 2);
    drawCorner(2290, 1490, Math.PI);
    drawCorner(110, 1490, -Math.PI / 2);

    // Header RigCraft Emblem
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText('RIGCRAFT HARDWARE SIMULATOR & LABS', 1200, 220);

    // Certificate Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 78px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('CERTIFICATE OF MASTERY', 1200, 340);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '32px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('PC HARDWARE ARCHITECTURE, ASSEMBLY & DIAGNOSTICS', 1200, 420);

    // Gold Divider Ribbon
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(850, 460);
    ctx.lineTo(1550, 460);
    ctx.stroke();

    // Small Diamond in Center of Divider
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(1200, 452);
    ctx.lineTo(1210, 460);
    ctx.lineTo(1200, 468);
    ctx.lineTo(1190, 460);
    ctx.closePath();
    ctx.fill();

    // "This credential is proudly presented to"
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 34px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('This credential is officially conferred upon', 1200, 560);

    // Learner Name (Huge, Crisp, Heroic)
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 96px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(profile.name.toUpperCase(), 1200, 690);

    // Underline beneath name
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(600, 720);
    ctx.lineTo(1800, 720);
    ctx.stroke();

    // Body Prose Description
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '30px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(
      'for successfully demonstrating professional competence in computer assembly,',
      1200,
      800
    );
    ctx.fillText(
      'safe electrical teardown protocols, discrete GPU cabling, high-speed bus interfaces,',
      1200,
      850
    );
    ctx.fillText(
      'and comprehensive hardware peripheral classification with honors.',
      1200,
      900
    );

    // Candidate Designation & Score
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '1px';
    const scoreText = profile.examScore !== null ? ` · Examination Grade: ${profile.examScore}%` : '';
    ctx.fillText(`Designation: ${profile.title.toUpperCase()}${scoreText}`, 1200, 980);

    // Wax Seal / Gold Medallion in Center-Bottom
    const sealX = 1200;
    const sealY = 1180;

    // Outer Seal Ring
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(sealX, sealY, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(sealX, sealY, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('VERIFIED', sealX, sealY - 10);
    ctx.fillText('EXCELLENCE', sealX, sealY + 22);

    // Left Signature & Date Zone
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px "Space Mono", monospace';
    ctx.fillText(`DATE OF ISSUANCE: ${currentDate.toUpperCase()}`, 300, 1340);
    ctx.fillText(`CREDENTIAL ID: ${certId}`, 300, 1390);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 1300);
    ctx.lineTo(680, 1300);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Elena Vance', 300, 1285);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Director of Computer Systems', 300, 1320);

    // Right Signature & Lab Validation Zone
    ctx.textAlign = 'right';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Marcus Thorne, Ph.D.', 2100, 1285);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1720, 1300);
    ctx.lineTo(2100, 1300);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Dean of Hardware Engineering', 2100, 1320);

    ctx.font = '24px "Space Mono", monospace';
    ctx.fillText(`SECURITY HASH: 0x${Math.abs(certId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) * 8191).toString(16).toUpperCase()}`, 2100, 1390);

    return canvas;
  };

  /**
   * Generates a 800x800 crisp Canvas render of a specific badge for PNG download.
   */
  const drawBadgeToCanvas = (badge: BadgeItem): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Dark sleek background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 800, 800);

    // Glowing circle
    const grad = ctx.createRadialGradient(400, 400, 50, 400, 400, 360);
    grad.addColorStop(0, badge.color + '33');
    grad.addColorStop(0.7, '#0f172a');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 800);

    // Gold / metallic badge ring
    ctx.strokeStyle = badge.color;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(400, 340, 200, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(400, 340, 180, 0, Math.PI * 2);
    ctx.stroke();

    // Badge Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badge.name, 400, 330);

    ctx.fillStyle = badge.color;
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(badge.title.toUpperCase(), 400, 375);

    // Recipient Name
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`CONFERRED TO: ${profile.name.toUpperCase()}`, 400, 620);

    // Subtext & Date
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px "Space Mono", monospace';
    ctx.fillText(`RIGCRAFT VERIFIED · ${currentDate.toUpperCase()}`, 400, 670);

    return canvas;
  };

  const handleDownloadCertificatePNG = () => {
    sounds.playClick();
    setDownloadingFormat('png');
    setTimeout(() => {
      const canvas = drawCertificateToCanvas();
      const link = document.createElement('a');
      link.download = `RigCraft_Certificate_${profile.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloadingFormat(null);
      sounds.playSuccess();
    }, 200);
  };

  const handleDownloadCertificatePDF = () => {
    sounds.playClick();
    setDownloadingFormat('pdf');
    setTimeout(() => {
      try {
        const canvas = drawCertificateToCanvas();
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // A4 Landscape is 297mm x 210mm
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
        pdf.save(`RigCraft_Certificate_${profile.name.replace(/\s+/g, '_')}.pdf`);
        sounds.playSuccess();
      } catch (err) {
        console.error('PDF generation error', err);
      } finally {
        setDownloadingFormat(null);
      }
    }, 250);
  };

  const handleDownloadBadge = (badge: BadgeItem) => {
    sounds.playClick();
    const canvas = drawBadgeToCanvas(badge);
    const link = document.createElement('a');
    link.download = `Badge_${badge.name.replace(/\s+/g, '_')}_${profile.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    sounds.playSuccess();
  };

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Award className="w-4 h-4" />
            <span>Credentials & Accreditations</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Official Badges & Certificate of Mastery
          </h1>
          <p className="text-xs text-slate-400">
            Download your high-resolution badges and formal certificate in vector-grade PNG and PDF formats with guaranteed formatting.
          </p>
        </div>

        {/* Action Buttons for Certificate */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleDownloadCertificatePNG}
            disabled={downloadingFormat !== null}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingFormat === 'png' ? 'Generating PNG...' : 'Download PNG'}</span>
          </button>

          <button
            onClick={handleDownloadCertificatePDF}
            disabled={downloadingFormat !== null}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-500/10"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{downloadingFormat === 'pdf' ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Interactive Certificate Preview Box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>Official Certificate of Mastery (Live Preview)</span>
          <span className="text-cyan-400">Verified Credential · ID: {certId}</span>
        </div>

        <div
          id="certificate-print-area"
          ref={certificateRef}
          className="relative w-full aspect-16/10 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-600/80 p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col justify-between select-none"
        >
          {/* Inner hairline gold border */}
          <div className="absolute inset-3 border-2 border-amber-500/40 rounded-xl pointer-events-none" />

          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

          {/* Top Header */}
          <div className="text-center space-y-1 relative z-10">
            <div className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase font-bold">
              RigCraft Hardware Simulator & System Labs
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              CERTIFICATE OF MASTERY
            </h2>
            <div className="text-[10px] sm:text-xs font-medium text-slate-400 tracking-wider">
              PC HARDWARE ARCHITECTURE, ASSEMBLY & DIAGNOSTICS
            </div>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
          </div>

          {/* Middle Conferred Section */}
          <div className="text-center space-y-2 sm:space-y-3 relative z-10 my-4 sm:my-6">
            <div className="text-xs sm:text-sm text-slate-300 italic">
              This credential is officially conferred upon
            </div>
            <div className="text-2xl sm:text-4xl md:text-5xl font-black text-cyan-400 tracking-wide uppercase drop-shadow-md">
              {profile.name}
            </div>
            <div className="w-64 h-0.5 bg-cyan-600/40 mx-auto" />
            <p className="max-w-2xl mx-auto text-[11px] sm:text-xs md:text-sm text-slate-300 leading-relaxed px-4">
              for successfully demonstrating technical excellence in personal computer component assembly,
              safe teardown protocols, discrete GPU cabling, high-speed bus interfaces, and comprehensive
              peripheral diagnostics with distinction.
            </p>
            <div className="text-[11px] sm:text-xs font-mono text-amber-400 font-semibold">
              Designation: {profile.title}
              {profile.examScore !== null ? ` · Exam Grade: ${profile.examScore}%` : ''}
            </div>
          </div>

          {/* Bottom Signatures & Seal */}
          <div className="flex items-end justify-between relative z-10 pt-4 border-t border-slate-800 text-[10px] sm:text-xs text-slate-400">
            {/* Left Signee */}
            <div className="text-left space-y-1">
              <div className="italic text-slate-300 font-medium sm:text-sm">Elena Vance</div>
              <div className="w-24 sm:w-32 h-px bg-slate-600" />
              <div>Director of Computer Systems</div>
              <div className="font-mono text-[9px] sm:text-[10px] text-slate-500">
                DATE: {currentDate}
              </div>
            </div>

            {/* Center Gold Medallion */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 border-2 border-amber-300 flex flex-col items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 text-center leading-none p-1">
              <Sparkles className="w-4 h-4 mb-0.5" />
              <span className="text-[8px] sm:text-[9px] font-mono tracking-tighter">RIGCRAFT</span>
              <span className="text-[7px] sm:text-[8px] tracking-wider uppercase font-bold">VERIFIED</span>
            </div>

            {/* Right Signee */}
            <div className="text-right space-y-1">
              <div className="italic text-slate-300 font-medium sm:text-sm">Marcus Thorne, Ph.D.</div>
              <div className="w-24 sm:w-32 h-px bg-slate-600 ml-auto" />
              <div>Dean of Hardware Engineering</div>
              <div className="font-mono text-[9px] sm:text-[10px] text-slate-500">ID: {certId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Gallery with Download PNG buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Earned Badges & Medallions</h2>
            <p className="text-xs text-slate-400">
              Each badge can be individually saved as an official high-resolution PNG file.
            </p>
          </div>
          <div className="text-xs font-mono text-cyan-400">
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(badge => {
            const isUnlocked = badge.unlocked;
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-slate-900 border-slate-700/80 shadow-lg'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md border"
                      style={{
                        backgroundColor: isUnlocked ? `${badge.color}15` : '#0f172a',
                        borderColor: isUnlocked ? badge.color : '#334155',
                        color: isUnlocked ? badge.color : '#64748b',
                      }}
                    >
                      {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isUnlocked
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{badge.name}</h3>
                    <div
                      className="text-xs font-semibold font-mono"
                      style={{ color: isUnlocked ? badge.color : '#94a3b8' }}
                    >
                      {badge.title}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500 font-mono">
                    Req: {badge.requirement}
                  </div>

                  {isUnlocked && (
                    <button
                      onClick={() => handleDownloadBadge(badge)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
                      title="Download Badge PNG"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
