import React, { useState, useRef } from 'react';

// This tells TypeScript that emailjs will be available on the global scope
declare const emailjs: any;

const Contact: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;
    
    setStatus('sending');
    setStatusMessage('');

    const serviceID = 'service_opq3lea';
    const templateID = 'template_lhcwkvm';
    const publicKey = '8PT7MaT5kicnGM5FJ';
    
    emailjs.sendForm(serviceID, templateID, form.current, publicKey)
      .then(
        () => {
          setStatus('sent');
          setStatusMessage('Message sent successfully!');
          setFormData({ name: '', email: '', message: '' });
          setTimeout(() => {
            setStatus('idle');
            setStatusMessage('');
          }, 5000); // Reset status after 5 seconds
        },
        (error: any) => {
          setStatus('error');
          setStatusMessage('Failed to send message. Please try again later.');
          console.error('EmailJS Error:', error);
          setTimeout(() => {
            setStatus('idle');
            setStatusMessage('');
          }, 5000); // Reset status after 5 seconds
        }
      );
  };

  return (
    <section id="contact" className="py-20 sm:py-32 bg-dark-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Contact Us</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Have questions or need a consultation? Reach out to us.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-dark-card p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>
            <form ref={form} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="sr-only">Full name</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  autoComplete="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full bg-gray-800 border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red" 
                  placeholder="Full name" 
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  autoComplete="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full bg-gray-800 border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red" 
                  placeholder="Email address" 
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={4} 
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="block w-full bg-gray-800 border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red" 
                  placeholder="Your message"
                ></textarea>
              </div>
              <div>
                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-red transition-colors disabled:bg-red-900 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </div>
               {statusMessage && (
                <p className={`text-center text-sm font-medium ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {statusMessage}
                </p>
              )}
            </form>
          </div>
          <div className="text-gray-300">
            <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
            <div className="space-y-4 text-lg">
              <p className="flex items-start">
                <span className="w-6 h-6 mr-4 mt-1 text-brand-red">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </span>
                <a href="mailto:cliffordthabo32@gmail.com" className="hover:text-brand-red">cliffordthabo32@gmail.com</a>
              </p>
              <p className="flex items-start">
                 <span className="w-6 h-6 mr-4 mt-1 text-brand-red">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </span>
                <span>+27 81 715 3073</span>
              </p>
              <p className="flex items-start">
                <span className="w-6 h-6 mr-4 mt-1 text-brand-red">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecaption="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </span>
                <span>
                  563 Olivertambo Street, Klipfontein View, <br />Midrand, 1685
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;