import React, { useState } from 'react';
import { CertificateItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { Award, ExternalLink, Calendar, FileText, CheckCircle2, X } from 'lucide-react';

interface CertificatesPageProps {
  certificates: CertificateItem[];
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({
  certificates,
  isAdmin,
  onOpenAdmin,
}) => {
  const publishedCerts = certificates.filter((c) => c.published || isAdmin);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#3A0F05] ribbon-underline">
              Certifications & Badges
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85203F] mt-2">
            Verified credentials, accreditations, and course achievements.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            + Add Certificate
          </button>
        )}
      </div>

      {publishedCerts.length === 0 ? (
        <EmptyState
          title="Certificates coming soon"
          message="Subaithal is preparing verified course credentials and certifications. Updates will be visible here once published!"
          actionText={isAdmin ? 'Add Certificate' : undefined}
          onAction={onOpenAdmin}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedCerts.map((cert) => {
            const isPdf = cert.fileUrl?.startsWith('data:application/pdf') || cert.fileUrl?.toLowerCase().endsWith('.pdf');
            return (
              <div
                key={cert.id}
                className="glass-card glass-card-hover p-6 rounded-[22px] flex flex-col justify-between space-y-4 border border-white/70 group"
              >
                <div className="space-y-3">
                  {/* Top Badge & Issuer */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-2xl bg-white/70 text-[#8F2547] border border-white/80 shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    {cert.credentialId && (
                      <span className="text-[10px] font-mono text-[#85203F] bg-white/60 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                        ID: {cert.credentialId}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#3A0F05] group-hover:text-[#8F2547] transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#8F2547] mt-0.5">
                      {cert.issuer}
                    </p>
                  </div>

                  {cert.description && (
                    <p className="text-xs text-[#4F2119]/80 line-clamp-2 leading-relaxed">
                      {cert.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-[#4F2119]/70 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C9577B]" />
                    <span>Issued: {cert.issueDate}</span>
                    {cert.expiryDate && <span>· Exp: {cert.expiryDate}</span>}
                  </div>
                </div>

                {/* Bottom preview or verification link */}
                <div className="pt-3 border-t border-white/40 flex items-center justify-between">
                  {cert.fileUrl ? (
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="text-xs font-semibold text-[#8F2547] hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isPdf ? 'View PDF' : 'View Certificate'}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#85203F] italic">Verified entry</span>
                  )}

                  {cert.verifyLink && (
                    <a
                      href={cert.verifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-rose-secondary px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && selectedCert.fileUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-3xl w-full max-h-[92vh] flex flex-col p-6 sm:p-7 relative border-2 border-white/80 shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 text-[#85203F] transition-colors"
              aria-label="Close certificate modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <TeddyBear variant="heading" size={24} />
              <div>
                <h3 className="font-heading font-bold text-lg text-[#3A0F05]">
                  {selectedCert.title}
                </h3>
                <p className="text-xs text-[#85203F]">{selectedCert.issuer}</p>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-white/80 bg-white/40 p-2 flex items-center justify-center min-h-[300px]">
              {selectedCert.fileUrl.startsWith('data:application/pdf') || selectedCert.fileUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedCert.fileUrl}
                  title={selectedCert.title}
                  className="w-full h-[500px] rounded-lg border-0"
                />
              ) : (
                <img
                  src={selectedCert.fileUrl}
                  alt={selectedCert.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm"
                />
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/50 flex items-center justify-between">
              <span className="text-xs text-[#85203F]">
                Credential ID: {selectedCert.credentialId || 'N/A'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedCert.fileUrl}
                  download={`certificate-${selectedCert.title.replace(/\s+/g, '_')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold"
                >
                  Download Document
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
