import React, { useState } from 'react';
import AwwwardsLoader from './AwwwardsLoader';

const HeroSection: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  };

  return (
    <>
      {showLoader && <AwwwardsLoader onComplete={handleLoaderComplete} />}
      
      <section className={`bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col overflow-hidden transition-all duration-1000 ${
        showLoader ? 'opacity-0' : 'opacity-100 animate-reveal-scale'
      }`}>
      <nav className={`flex justify-between items-center px-6 py-4 bg-white shadow-sm transform transition-transform duration-1000 ${isLoaded ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-black rounded transform rotate-45 flex items-center justify-center transition-all duration-300 group-hover:rotate-[60deg] group-hover:scale-110">
            <span className="text-white text-xs font-bold transform -rotate-45 group-hover:-rotate-[60deg] transition-transform duration-300">V</span>
          </div>
          <span className="text-xl font-bold transition-colors duration-300 group-hover:text-blue-600">Valyra</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group">
            Browse Deals
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <div className="relative group">
            <button className="text-gray-700 hover:text-gray-900 flex items-center transition-all duration-300">
              Platform
              <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <a href="#" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group">
            How It Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group">
            For Founders
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group">
            For Acquirers
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
            Connect
          </button>
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
            <svg className="w-6 h-6 transition-transform duration-300 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      <div className={`flex-1 flex flex-col items-center justify-center px-6 text-center transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star, index) => (
              <svg 
                key={star} 
                className={`w-6 h-6 text-yellow-400 fill-current transform transition-all duration-500 hover:scale-125 cursor-pointer`}
                style={{ animationDelay: `${index * 200}ms` }}
                viewBox="0 0 24 24"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.25) rotate(360deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <p className="text-gray-600 text-sm mb-8 animate-fadeIn">Trusted by Web3 founders & acquirers</p>
        </div>

        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          Decentralized{' '}
          <span className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl text-white text-2xl font-bold mx-2 transform rotate-12 hover:rotate-[30deg] hover:scale-110 transition-all duration-500 animate-float">
            M&A
          </span>{' '}
          Platform for
          <br />
          Web3 Companies{' '}
          <span className="inline-block bg-orange-400 text-white px-4 py-2 rounded-full text-lg font-medium transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 animate-float-delayed">
            Fetch.ai
          </span>
        </h1>

        <p className={`text-xl text-gray-600 mb-12 max-w-2xl transform transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          Connect Web3 founders with acquirers using AI-powered matching, automated valuations, and secure escrow on the Internet Computer.
        </p>

        <div className={`flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 transform transition-all duration-1000 delay-900 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-xl active:scale-95 group">
            <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Get Started</span>
          </button>
          
          <button className="text-gray-700 text-lg font-medium hover:text-gray-900 transition-all duration-300 relative group transform hover:scale-105">
            About Valyra
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-700 group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>
      </div>

      <div className={`pb-16 transform transition-all duration-1000 delay-1100 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <p className="text-center text-gray-500 text-sm mb-8">Powered by</p>
        <div className="flex justify-center items-center space-x-12 opacity-60">
          {['Fetch.ai', 'ICP', 'Rust', 'ReactJS'].map((company, index) => (
            <div 
              key={company}
              className={`text-gray-400 text-lg font-semibold hover:text-gray-600 transition-all duration-500 cursor-pointer transform hover:scale-110 animate-fadeInUp`}
              style={{ animationDelay: `${1200 + index * 100}ms` }}
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default HeroSection;