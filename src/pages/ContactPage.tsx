import React, { useState } from 'react';
import { ProfileData } from '../types/portfolio';
import { TeddyBear } from '../components/TeddyBear';
import { Mail, Linkedin, Github, MapPin, Send, CheckCircle2, Copy, Check } from 'lucide-react';
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
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#D4436E', '#F472B6', '#E11D48', '#FFFFFF'],
        });
      } catch (e) {
        // Ignore if confetti not supported
      }
    }, 700);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-10 text-left">
      {/* Header */}
      <div className="border-b border-rose-500/20 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <TeddyBear variant="heading" size={26} animated />
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-rose-100 ribbon-underline tracking-tight">
            Get in Touch
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-rose-200/70 mt-2 font-medium">
          Feel free to reach out for collaborations, job opportunities, or inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Links & Contact Cards */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card p-6 sm:p-7 rounded-[22px] border border-rose-500/20 space-y-5 shadow-sm">
            <h3 className="font-heading font-bold text-xl text-rose-100">
              Direct Contact
            </h3>

            {/* Email item */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block">
                Email Address
              </span>
              <div className="flex items-center justify-between gap-2 p-3 bg-rose-950/50 rounded-2xl border border-rose-500/30">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 bg-rose-900/60 rounded-xl text-rose-300 shrink-0 border border-rose-500/20">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-xs font-semibold text-rose-200 hover:text-rose-100 truncate"
                  >
                    {contactEmail}
                  </a>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg hover:bg-rose-900/60 text-rose-300 shrink-0 transition-colors cursor-pointer"
                  title="Copy email"
                  aria-label="Copy email address"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block">
                LinkedIn Profile
              </span>
              <a
                href={profile.linkedIn || 'https://www.linkedin.com/in/subaithal-s-812584426'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-rose-950/50 hover:bg-rose-900/50 rounded-2xl border border-rose-500/30 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-950/60 rounded-xl text-blue-400 shrink-0 border border-blue-500/30">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-rose-200 group-hover:text-rose-100">
                    subaithal-s-812584426
                  </span>
                </div>
                <span className="text-xs text-rose-400 font-semibold">Open &rarr;</span>
              </a>
            </div>

            {/* GitHub */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block">
                GitHub Repository
              </span>
              <a
                href={profile.gitHub || 'https://github.com/Subaithals'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-rose-950/50 hover:bg-rose-900/50 rounded-2xl border border-rose-500/30 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-900/60 rounded-xl text-slate-300 shrink-0 border border-slate-500/30">
                    <Github className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-rose-200 group-hover:text-rose-100">
                    Subaithals
                  </span>
                </div>
                <span className="text-xs text-rose-400 font-semibold">Open &rarr;</span>
              </a>
            </div>

            {/* Location if specified */}
            {profile.location && (
              <div className="pt-2 border-t border-rose-500/20 flex items-center gap-2 text-xs text-rose-300">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Based in {profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 sm:p-8 rounded-[22px] border border-rose-500/20 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xl text-rose-100">
                Send a Direct Message
              </h3>
              <TeddyBear variant="heading" size={24} />
            </div>

            {isSuccess ? (
              <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-950/80 text-emerald-300 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-bold text-2xl text-rose-100">
                  Message Sent Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-rose-200/90 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to Subaithal S. A response will be sent to <strong className="text-rose-100">{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="btn-rose-secondary px-5 py-2 rounded-full text-xs font-semibold mt-4 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-rose-200">
                      Your Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs text-rose-100 placeholder:text-rose-300/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-rose-200">
                      Your Email <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs text-rose-100 placeholder:text-rose-300/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-rose-200">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Collaboration Inquiry / Job Opportunity"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs text-rose-100 placeholder:text-rose-300/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-rose-200">
                    Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Hello Subaithal, I'd love to connect regarding..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs text-rose-100 placeholder:text-rose-300/40"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-rose-300/80">
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
