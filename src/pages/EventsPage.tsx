import React, { useState } from 'react';
import { EventItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { Calendar, MapPin, Award, Users, Image as ImageIcon, X } from 'lucide-react';

interface EventsPageProps {
  events: EventItem[];
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  isAdmin,
  onOpenAdmin,
}) => {
  const publishedEvents = events.filter((e) => e.published || isAdmin);
  const [photoViewer, setPhotoViewer] = useState<{ title: string; photos: string[] } | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#3A0F05] ribbon-underline">
              Events & Hackathons
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85203F] mt-2">
            Workshops, technology symposiums, competitive hackathons, and conferences.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            + Add Event
          </button>
        )}
      </div>

      {publishedEvents.length === 0 ? (
        <EmptyState
          title="Events coming soon"
          message="Subaithal's participation in conferences, workshops, and hackathons will appear here soon!"
          actionText={isAdmin ? 'Add Event' : undefined}
          onAction={onOpenAdmin}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedEvents.map((event) => (
            <div
              key={event.id}
              className="glass-card glass-card-hover overflow-hidden rounded-[22px] border border-white/70 flex flex-col justify-between group"
            >
              {/* Event Poster or Graphic */}
              <div className="relative aspect-video w-full bg-pink-100/70 overflow-hidden">
                {event.posterUrl ? (
                  <img
                    src={event.posterUrl}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FCE5ED] to-[#EBA3B8]/40 text-[#8F2547]">
                    <TeddyBear variant="heading" size={40} />
                    <span className="text-[11px] font-medium mt-1 text-[#85203F]">
                      Event Highlight
                    </span>
                  </div>
                )}

                {/* Participation status tag */}
                <div className="absolute top-3 right-3 bg-[#8F2547] text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase shadow-sm">
                  {event.participationStatus}
                </div>
              </div>

              {/* Event Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-lg text-[#3A0F05] group-hover:text-[#8F2547] transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#8F2547] font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#C9577B]" />
                    <span>{event.organizer}</span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-[#4F2119]/80 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/40 text-[11px] text-[#85203F]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A93A5C]" />
                    <span>{event.date}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#A93A5C]" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Photos & Certificate button */}
                <div className="pt-3 border-t border-white/40 flex items-center justify-between">
                  {event.photos && event.photos.length > 0 ? (
                    <button
                      onClick={() => setPhotoViewer({ title: event.title, photos: event.photos })}
                      className="text-xs font-semibold text-[#8F2547] hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{event.photos.length} Photo{event.photos.length > 1 ? 's' : ''}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#85203F] italic">Participated</span>
                  )}

                  {event.certificateUrl && (
                    <a
                      href={event.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-rose-secondary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      <Award className="w-3 h-3 text-[#8F2547]" />
                      <span>Certificate</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Gallery Lightbox */}
      {photoViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-3xl w-full max-h-[90vh] flex flex-col p-6 relative border-2 border-white/80 shadow-2xl overflow-y-auto">
            <button
              onClick={() => setPhotoViewer(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 text-[#85203F]"
              aria-label="Close photos"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-bold text-xl text-[#3A0F05] mb-4">
              {photoViewer.title} — Photos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photoViewer.photos.map((photoUrl, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-white/80 aspect-video bg-white/40">
                  <img
                    src={photoUrl}
                    alt={`${photoViewer.title} snapshot ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
