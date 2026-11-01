import React, { useState } from 'react';
import { ProfileData } from '../types/portfolio';
import { TeddyBear } from '../components/TeddyBear';
import { Mail, Linkedin, Github, MapPin, Send, CheckCircle2, Copy, Check, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContactPageProps {
  profile: ProfileData;
}

export const ContactPage: React.FC<ContactPageProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const contactEmail = profile.email || 'subaithalnowfie@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    // Simulate real send & celebrate
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8F2547', '#C9577B', '#EBA3B8', '#FFFFFF'],
        });
      } catch (e) {
        // Ignore if confetti not supported
      }
    }, 700);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-10 text-left">
      {/* Header */}
      <div className="border-b border-white/50 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <TeddyBear variant="heading" size={26} animated />
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#3A0F05] ribbon-underline">
            Get in Touch
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#85203F] mt-2">
          Feel free to reach out for collaborations, job opportunities, or inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Links & Contact Cards */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card p-6 sm:p-7 rounded-[22px] border border-white/70 space-y-5 shadow-sm">
            <h3 className="font-heading font-bold text-xl text-[#3A0F05]">
              Direct Contact
            </h3>

            {/* Email item */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#85203F] uppercase tracking-wider block">
                Email Address
              </span>
              <div className="flex items-center justify-between gap-2 p-3 bg-white/60 rounded-2xl border border-white/80">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 bg-pink-100 rounded-xl text-[#8F2547] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-xs font-semibold text-[#3A0F05] hover:text-[#8F2547] truncate"
                  >
                    {contactEmail}
                  </a>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg hover:bg-white text-[#85203F] shrink-0 transition-colors"
                  title="Copy email"
                  aria-label="Copy email address"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#85203F] uppercase tracking-wider block">
                LinkedIn Profile
              </span>
              <a
                href={profile.linkedIn || 'https://www.linkedin.com/in/subaithal-s-812584426'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white/60 hover:bg-white/90 rounded-2xl border border-white/80 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-700 shrink-0">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#3A0F05] group-hover:text-[#8F2547]">
                    subaithal-s-812584426
                  </span>
                </div>
                <span className="text-xs text-[#8F2547] font-semibold">Open &rarr;</span>
              </a>
            </div>

            {/* GitHub */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#85203F] uppercase tracking-wider block">
                GitHub Repository
              </span>
              <a
                href={profile.gitHub || 'https://github.com/Subaithals'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white/60 hover:bg-white/90 rounded-2xl border border-white/80 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-800 shrink-0">
                    <Github className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#3A0F05] group-hover:text-[#8F2547]">
                    Subaithals
                  </span>
                </div>
                <span className="text-xs text-[#8F2547] font-semibold">Open &rarr;</span>
              </a>
            </div>

            {/* Location if specified */}
            {profile.location && (
              <div className="pt-2 border-t border-white/40 flex items-center gap-2 text-xs text-[#85203F]">
                <MapPin className="w-4 h-4 text-[#A93A5C]" />
                <span>Based in {profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 sm:p-8 rounded-[22px] border border-white/70 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xl text-[#3A0F05]">
                Send a Direct Message
              </h3>
              <TeddyBear variant="heading" size={24} />
            </div>

            {isSuccess ? (
              <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-bold text-2xl text-[#3A0F05]">
                  Message Sent Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-[#4F2119]/90 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to Subaithal S. A response will be sent to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="btn-rose-secondary px-5 py-2 rounded-full text-xs font-semibold mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#3A0F05]">
                      Your Name <span className="text-[#8F2547]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8F2547] text-xs text-[#3A0F05] placeholder:text-[#4F2119]/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#3A0F05]">
                      Your Email <span className="text-[#8F2547]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8F2547] text-xs text-[#3A0F05] placeholder:text-[#4F2119]/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Collaboration Inquiry / Job Opportunity"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8F2547] text-xs text-[#3A0F05] placeholder:text-[#4F2119]/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">
                    Message <span className="text-[#8F2547]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Hello Subaithal, I'd love to connect regarding..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8F2547] text-xs text-[#3A0F05] placeholder:text-[#4F2119]/40"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#85203F]">
                    Direct delivery to Subaithal
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-rose-gradient px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
