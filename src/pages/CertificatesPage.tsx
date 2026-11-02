import React, { useState } from 'react';
import { CertificateItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { Award, ExternalLink, Calendar, FileText, Eye, CheckCircle2, Images } from 'lucide-react';

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
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    images: string[];
    initialIndex: number;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    images: [],
    initialIndex: 0,
  });

  const handleOpenCertificate = (cert: CertificateItem, initialIndex = 0) => {
    // Gather all media: cert.images array + cert.fileUrl (if not already included)
    const allImages: string[] = [];
    if (cert.fileUrl) allImages.push(cert.fileUrl);
    if (cert.images && cert.images.length > 0) {
      cert.images.forEach((img) => {
        if (!allImages.includes(img)) allImages.push(img);
      });
    }

    if (allImages.length === 0) return;

    setLightboxData({
      isOpen: true,
      title: cert.title,
      subtitle: `${cert.issuer} · Issued: ${cert.issueDate}${cert.credentialId ? ` · ID: ${cert.credentialId}` : ''}`,
      images: allImages,
      initialIndex,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-rose-50 ribbon-underline">
            Certifications & Badges
          </h1>
          <p className="text-xs sm:text-sm text-rose-300/80 mt-2">
            Verified professional credentials, licensures, and accreditations.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto cursor-pointer"
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
            const allMedia: string[] = [];
            if (cert.fileUrl) allMedia.push(cert.fileUrl);
            if (cert.images && cert.images.length > 0) {
              cert.images.forEach((img) => {
                if (!allMedia.includes(img)) allMedia.push(img);
              });
            }

            const primaryImage = allMedia[0] || '';
            const isPdf = primaryImage.startsWith('data:application/pdf') || primaryImage.toLowerCase().endsWith('.pdf');

            return (
              <div
                key={cert.id}
                className="glass-card glass-card-hover overflow-hidden rounded-[20px] flex flex-col justify-between border border-rose-500/20 group transition-all"
              >
                {/* Visual Certificate Preview Card Header */}
                <div 
                  onClick={() => allMedia.length > 0 && handleOpenCertificate(cert, 0)}
                  className="relative aspect-[16/10] w-full bg-[#1A0813]/90 border-b border-rose-500/15 overflow-hidden flex items-center justify-center cursor-pointer group"
                >
                  {primaryImage ? (
                    isPdf ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-950/40 to-[#1F0815] text-rose-300">
                        <FileText className="w-12 h-12 text-rose-400 mb-2" />
                        <span className="text-xs font-semibold text-rose-200">Verified PDF Credential</span>
                        <span className="text-[10px] text-rose-400/80 mt-1">Click to view & zoom</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={primaryImage}
                          alt={cert.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3.5 py-1.5 rounded-full bg-[#16060E]/90 text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                            <Eye className="w-3.5 h-3.5 text-rose-300" />
                            <span>View Certificate</span>
                          </span>
                        </div>
                      </>
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-950/40 to-[#1F0815] text-rose-400">
                      <Award className="w-10 h-10 mb-2 opacity-80" />
                      <span className="text-xs font-medium text-rose-300">Verified Accreditation</span>
                    </div>
                  )}

                  {/* Multiple image indicator badge */}
                  {allMedia.length > 1 && (
                    <div className="absolute top-3 left-3 bg-[#16060E]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-rose-200 border border-rose-500/30 flex items-center gap-1 shadow-sm">
                      <Images className="w-3 h-3 text-rose-300" />
                      <span>{allMedia.length} Pages</span>
                    </div>
                  )}

                  {/* Credential ID badge */}
                  {cert.credentialId && (
                    <div className="absolute top-3 right-3 bg-[#16060E]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-rose-300 border border-rose-500/30 shadow-sm truncate max-w-[140px]">
                      ID: {cert.credentialId}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 
                      onClick={() => allMedia.length > 0 && handleOpenCertificate(cert, 0)}
                      className="font-heading font-bold text-lg text-rose-50 group-hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      {cert.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#E65A84]">
                      {cert.issuer}
                    </p>

                    {cert.description && (
                      <p className="text-xs text-rose-200/80 line-clamp-2 leading-relaxed">
                        {cert.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-rose-300/70 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>Issued: {cert.issueDate}</span>
                      {cert.expiryDate && <span>· Exp: {cert.expiryDate}</span>}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-rose-500/15 flex items-center justify-between">
                    {allMedia.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleOpenCertificate(cert, 0)}
                        className="btn-rose-secondary px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-rose-300" />
                        <span>View Certificate</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-rose-400 italic">Verified Record</span>
                    )}

                    {cert.verifyLink && (
                      <a
                        href={cert.verifyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-rose-300 hover:text-white flex items-center gap-1 hover:underline ml-auto"
                      >
                        <span>Verify Issuer</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Certificate Lightbox with Zoom, Rotate, and Multi-page strip */}
      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData({ ...lightboxData, isOpen: false })}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        images={lightboxData.images}
        initialIndex={lightboxData.initialIndex}
      />
    </div>
  );
};
