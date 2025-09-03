import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const companyLinks = [
    { name: 'Home', to: '/' },
    { name: 'About Us', to: '/about' },
    { name: 'Delivery', to: '/delivery' },
    { name: 'Privacy Policy', to: '/privacy-policy' },
    { name: 'Terms & Conditions', to: '/terms' },
  ];

  const contactInfo = [
    { icon: <FiPhone className="w-4 h-4" />, text: '+1-212-456-7890' },
    { icon: <FiMail className="w-4 h-4" />, text: 'contact@vandire.com' },
  ];

  const socialLinks = [
    { icon: <FiFacebook className="w-5 h-5" />, url: '#' },
    { icon: <FiTwitter className="w-5 h-5" />, url: '#' },
    { icon: <FiInstagram className="w-5 h-5" />, url: '#' },
    { icon: <FiLinkedin className="w-5 h-5" />, url: '#' },
  ];

  return (
    <footer className="bg-gray-50 mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="uppercase text-2xl tracking-extra-widest font-bold text-gray-800" style={{ fontFamily: 'Cinzel, Playfair Display, ui-serif, Georgia, Cambria, Times New Roman, Times, serif', letterSpacing: '0.18em' }}>VANDIRE</span>
            </Link>
            <p className="text-gray-600 leading-relaxed">
              Vandire is your trusted destination for quality products and seamless shopping. 
              We are committed to delivering the best online experience with secure payments 
              and fast delivery.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-black transition-colors"
                  aria-label={`Follow us on ${social.icon.type.displayName}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-600 hover:text-black transition-colors flex items-center group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-black transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-500 mt-0.5 mr-3">{item.icon}</span>
                  <span className="text-gray-600">{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">SUBSCRIBE TO OUR NEWSLETTER</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 text-sm border border-r-0 border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent rounded-l-md w-full"
                />
                <button className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded-r-md transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>


        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Vandire. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
