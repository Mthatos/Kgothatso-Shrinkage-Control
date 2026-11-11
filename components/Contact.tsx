import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-dark-bg relative overflow-hidden border-t border-gray-900">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-brand-red/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-brand-red"></span>
            <span className="text-xs uppercase tracking-widest text-brand-red font-bold">
              Direct Inquiries
            </span>
            <span className="w-6 h-0.5 bg-brand-red"></span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Our Inventory Specialists
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Schedule an on-site retail shrinkage evaluation or consult with our lead inventory auditors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="bg-dark-card p-8 rounded-2xl border border-gray-800 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6">Send an Audit Request</h3>

            {submitted ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Message Received</h4>
                <p className="text-xs text-emerald-200">
                  Thank you, {formData.name}. A senior auditor will review your retail requirements and reach out within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                  className="text-xs text-gray-400 hover:text-white underline pt-2 block mx-auto"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Full Name or Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                    placeholder="e.g. Clifford Thabo / Midrand Supermarket"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                    placeholder="you@company.co.za"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Store Type &amp; Locations *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="block w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                    placeholder="Describe your store branches, inventory frequency, or stocktaking challenges..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-red transition-all transform active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Information & Branches */}
          <div className="space-y-6">
            <div className="bg-dark-card p-8 rounded-2xl border border-gray-800 shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-white">Headquarters &amp; Direct Line</h3>

              <div className="space-y-5 text-sm text-gray-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/15 text-brand-red border border-brand-red/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 block font-semibold">
                      Email Inquiries
                    </span>
                    <a
                      href="mailto:cliffordthabo32@gmail.com"
                      className="text-white hover:text-brand-red transition-colors font-medium text-base"
                    >
                      cliffordthabo32@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/15 text-brand-red border border-brand-red/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 block font-semibold">
                      Phone / WhatsApp
                    </span>
                    <a
                      href="tel:+27817153073"
                      className="text-white hover:text-brand-red transition-colors font-mono font-bold text-base"
                    >
                      +27 81 715 3073
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/15 text-brand-red border border-brand-red/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 block font-semibold">
                      Primary Operational Base
                    </span>
                    <p className="text-white text-sm font-medium leading-relaxed">
                      563 Olivertambo Street, Klipfontein View,
                      <br />
                      Midrand, Gauteng, 1685
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Coverage Card */}
            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 space-y-1.5">
              <span className="font-bold text-white uppercase tracking-wider block">
                Regional On-Site Service Coverage
              </span>
              <p>
                Johannesburg Metro &bull; Midrand &bull; Pretoria &bull; Centurion &bull; Ekurhuleni &bull; Greater Gauteng
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
