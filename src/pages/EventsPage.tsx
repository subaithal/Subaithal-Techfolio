import React, { useState } from 'react';
import { EventItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { Calendar, MapPin, Award, Users, Image as ImageIcon, Eye } from 'lucide-react';

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

  const handleOpenEventGallery = (event: EventItem, index = 0) => {
    const images: string[] = [];
    if (event.posterUrl) images.push(event.posterUrl);
    if (event.photos && event.photos.length > 0) {
      event.photos.forEach((p) => {
        if (!images.includes(p)) images.push(p);
      });
    }

    if (images.length === 0) return;

    setLightboxData({
      isOpen: true,
      title: event.title,
      subtitle: `${event.organizer} · ${event.date}${event.location ? ` · ${event.location}` : ''}`,
      images,
      initialIndex: index,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-rose-50 ribbon-underline">
            Events & Hackathons
          </h1>
          <p className="text-xs sm:text-sm text-rose-300/80 mt-2">
            Workshops, technology symposiums, competitive hackathons, and conferences.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto cursor-pointer"
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
          {publishedEvents.map((event) => {
            const allMedia: string[] = [];
            if (event.posterUrl) allMedia.push(event.posterUrl);
            if (event.photos && event.photos.length > 0) {
              event.photos.forEach((p) => {
                if (!allMedia.includes(p)) allMedia.push(p);
              });
            }

            return (
              <div
                key={event.id}
                className="glass-card glass-card-hover overflow-hidden rounded-[20px] border border-rose-500/20 flex flex-col justify-between group transition-all"
              >
                {/* Event Poster or Graphic */}
                <div 
                  onClick={() => allMedia.length > 0 && handleOpenEventGallery(event, 0)}
                  className="relative aspect-video w-full bg-[#1A0813] overflow-hidden cursor-pointer group"
                >
                  {event.posterUrl ? (
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-950/40 to-[#1F0815] text-rose-300">
                      <Calendar className="w-10 h-10 mb-2 opacity-80" />
                      <span className="text-[11px] font-medium text-rose-300">
                        Event Showcase
                      </span>
                    </div>
                  )}

                  {/* Participation status tag */}
                  <div className="absolute top-3 right-3 bg-[#15070E]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-rose-200 border border-rose-500/30 shadow-sm uppercase">
                    {event.participationStatus}
                  </div>

                  {/* Multiple photos count badge */}
                  {event.photos && event.photos.length > 0 && (
                    <div className="absolute bottom-3 left-3 bg-[#15070E]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-rose-200 border border-rose-500/30 flex items-center gap-1 shadow-sm">
                      <ImageIcon className="w-3 h-3 text-rose-300" />
                      <span>{event.photos.length} Photo{event.photos.length > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Quick Zoom Preview Icon Overlay */}
                  {allMedia.length > 0 && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-[#16060E]/90 text-rose-200 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-3.5 h-3.5 text-rose-300" />
                        <span>View Gallery</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-heading font-bold text-lg text-rose-50 group-hover:text-rose-300 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#E65A84] font-semibold">
                      <Users className="w-3.5 h-3.5 text-rose-400" />
                      <span>{event.organizer}</span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-rose-200/80 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-rose-500/15 text-[11px] text-rose-300/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{event.date}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Photos & Certificate button */}
                  <div className="pt-3 border-t border-rose-500/15 flex items-center justify-between">
                    {allMedia.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleOpenEventGallery(event, 0)}
                        className="btn-rose-secondary px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-rose-300" />
                        <span>View Photos ({allMedia.length})</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-rose-400 italic">Participated</span>
                    )}

                    {event.certificateUrl && (
                      <a
                        href={event.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-rose-300 hover:text-white flex items-center gap-1 hover:underline ml-auto"
                      >
                        <Award className="w-3.5 h-3.5 text-rose-300" />
                        <span>Certificate</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox with Zoom and Pan */}
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
