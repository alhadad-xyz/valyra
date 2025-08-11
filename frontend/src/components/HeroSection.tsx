import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AwwwardsLoader from './AwwwardsLoader';
import { useAuth } from '../auth/AuthProvider';
import { useRole } from '../contexts/RoleContext';

const HeroSection: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const { isAuthenticated, login, logout, identity } = useAuth();
  const { isRoleSelected, clearRole } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (isRoleSelected) {
        navigate('/dashboard');
      } else {
        navigate('/role-selection');
      }
    }
  }, [isAuthenticated, isRoleSelected, navigate]);

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  };

  const handleLogout = async () => {
    clearRole();
    await logout();
  };

  const handleDashboardAccess = () => {
    if (isRoleSelected) {
      navigate('/dashboard');
    } else {
      navigate('/role-selection');
    }
  };

  return (
    <>
      {showLoader && <AwwwardsLoader onComplete={handleLoaderComplete} />}
      
      <section className={`bg-blue-50 min-h-screen flex flex-col overflow-hidden transition-all duration-1000 ${
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
          <a href="#browse-deals" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group scroll-smooth">
            Browse Deals
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#services" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group">
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group">
            How It Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#for-founders" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group">
            For Founders
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#for-acquirers" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group">
            For Acquirers
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {identity?.getPrincipal().toString().slice(0, 8)}...
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Connect with Internet Identity
            </button>
          )}
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
          {isAuthenticated ? (
            <button 
              onClick={handleDashboardAccess}
              className="bg-green-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-green-600 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-xl active:scale-95 group"
            >
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Access Dashboard</span>
            </button>
          ) : (
            <button 
              onClick={login}
              className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-xl active:scale-95 group"
            >
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Get Started</span>
            </button>
          )}
          
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

    {/* Marquee Section */}
    <section className="py-8 bg-white border-y border-gray-100 overflow-hidden">
      <div className="relative flex marquee-container">
        <div className="flex animate-marquee whitespace-nowrap">
          {[
            "Decentralized M&A Platform",
            "AI-Powered Valuations", 
            "Smart Contract Escrow",
            "Web3 Deal Matching",
            "Blockchain Security",
            "Automated Due Diligence",
            "Cross-Chain Transactions",
            "DeFi Acquisitions",
            "NFT Marketplace Deals",
            "GameFi Investments",
            "DAO Governance Tools",
            "Tokenized Assets",
            // Duplicate for seamless loop
            "Decentralized M&A Platform",
            "AI-Powered Valuations", 
            "Smart Contract Escrow",
            "Web3 Deal Matching",
            "Blockchain Security",
            "Automated Due Diligence",
            "Cross-Chain Transactions",
            "DeFi Acquisitions",
            "NFT Marketplace Deals",
            "GameFi Investments",
            "DAO Governance Tools",
            "Tokenized Assets"
          ].map((text, index) => (
            <span 
              key={index} 
              className="mx-8 text-2xl md:text-3xl font-bold text-gray-400 hover:text-gray-900 transition-colors duration-300 cursor-pointer group"
            >
              <span className="inline-flex items-center space-x-3">
                <span className="group-hover:scale-110 transition-transform duration-300">{text}</span>
                <span className="text-blue-500 group-hover:rotate-180 transition-transform duration-500">✦</span>
              </span>
            </span>
          ))}
        </div>
        
        <div className="flex animate-marquee2 whitespace-nowrap absolute top-0">
          {[
            "Institutional Grade Security",
            "Real-Time Market Analytics", 
            "Multi-Signature Wallets",
            "KYC/AML Compliance",
            "Regulatory Framework",
            "Professional Advisory",
            "24/7 Global Support",
            "Enterprise Solutions",
            "Strategic Partnerships",
            "Innovation Lab",
            "Research & Development",
            "Community Driven",
            // Duplicate for seamless loop
            "Institutional Grade Security",
            "Real-Time Market Analytics", 
            "Multi-Signature Wallets",
            "KYC/AML Compliance",
            "Regulatory Framework",
            "Professional Advisory",
            "24/7 Global Support",
            "Enterprise Solutions",
            "Strategic Partnerships",
            "Innovation Lab",
            "Research & Development",
            "Community Driven"
          ].map((text, index) => (
            <span 
              key={index} 
              className="mx-8 text-2xl md:text-3xl font-bold text-gray-400 hover:text-gray-900 transition-colors duration-300 cursor-pointer group"
            >
              <span className="inline-flex items-center space-x-3">
                <span className="group-hover:scale-110 transition-transform duration-300">{text}</span>
                <span className="text-purple-500 group-hover:rotate-180 transition-transform duration-500">✦</span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* Browse Deals Section */}
    <section id="browse-deals" className="min-h-screen bg-blue-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Clean Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Browse Live{' '}
            <span className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl text-white text-2xl font-bold mx-2 transform rotate-12 hover:rotate-[30deg] hover:scale-110 transition-all duration-500 animate-float">
              Deals
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover vetted Web3 companies ready for acquisition. Connect with high-potential startups through our streamlined platform.
          </p>
        </div>

        {/* Clean Stats */}
        <div className="flex justify-center space-x-8 mb-16">
          {[
            { value: '150+', label: 'Active Deals' },
            { value: '$2.4B', label: 'Total Value' },
            { value: '98%', label: 'Success Rate' }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white px-6 py-4 rounded-2xl shadow-sm transform hover:scale-105 transition-all duration-300 cursor-pointer animate-fadeInUp"
              style={{animationDelay: `${index * 200}ms`}}
            >
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Clean Deal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              company: "DeFi Exchange Pro",
              category: "DeFi",
              valuation: "$2.5M",
              revenue: "$500K ARR",
              description: "Next-generation decentralized exchange with advanced trading features",
              stage: "Growth",
              badge: "Hot Deal",
              badgeColor: "bg-red-500"
            },
            {
              company: "NFT Marketplace",
              category: "NFTs",
              valuation: "$1.8M",
              revenue: "$300K ARR",
              description: "Curated NFT platform for digital art and collectibles",
              stage: "Expansion",
              badge: "New",
              badgeColor: "bg-green-500"
            },
            {
              company: "GameFi Protocol",
              category: "Gaming",
              valuation: "$3.2M",
              revenue: "$750K ARR",
              description: "Play-to-earn gaming infrastructure with token economics",
              stage: "Scale",
              badge: "Featured",
              badgeColor: "bg-blue-500"
            },
            {
              company: "Web3 Analytics",
              category: "Infrastructure",
              valuation: "$1.5M",
              revenue: "$250K ARR",
              description: "Blockchain analytics and insights platform for enterprises",
              stage: "Growth",
              badge: "Verified",
              badgeColor: "bg-purple-500"
            },
            {
              company: "Cross-Chain Bridge",
              category: "Infrastructure",
              valuation: "$4.1M",
              revenue: "$900K ARR",
              description: "Secure multi-chain asset bridge protocol",
              stage: "Mature",
              badge: "Premium",
              badgeColor: "bg-yellow-500"
            },
            {
              company: "DAO Governance Tool",
              category: "Governance",
              valuation: "$2.0M",
              revenue: "$400K ARR",
              description: "Comprehensive DAO management and voting platform",
              stage: "Growth",
              badge: "Rising",
              badgeColor: "bg-indigo-500"
            }
          ].map((deal, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer animate-fadeInUp"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg transform group-hover:rotate-12 transition-transform duration-300">
                    {deal.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {deal.company}
                    </h3>
                    <p className="text-sm text-gray-500">{deal.category}</p>
                  </div>
                </div>
                <span className={`${deal.badgeColor} text-white text-xs px-2 py-1 rounded-full font-medium transform group-hover:scale-110 transition-transform duration-300`}>
                  {deal.badge}
                </span>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {deal.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Valuation</span>
                  <span className="font-bold text-gray-900">{deal.valuation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Revenue</span>
                  <span className="font-semibold text-green-600">{deal.revenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Stage</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">{deal.stage}</span>
                </div>
              </div>

              <button className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95">
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Clean CTA */}
        <div className="text-center">
          <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex items-center space-x-2 mx-auto">
            <span>View All Deals</span>
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    {/* Services Section */}
    <section id="services" className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Clean Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Our{' '}
            <span className="inline-flex items-center justify-center w-16 h-16 bg-orange-400 rounded-2xl text-white text-2xl font-bold mx-2 transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 animate-float-delayed">
              Services
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive M&A solutions powered by cutting-edge AI technology and blockchain infrastructure.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "AI-Powered Valuations",
              description: "Advanced algorithms analyze market data, financials, and growth metrics to provide accurate company valuations in real-time.",
              features: ["Real-time market analysis", "Financial modeling", "Growth projections", "Risk assessment"]
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: "Smart Deal Matching",
              description: "Our intelligent matching system connects the right buyers with the right sellers based on strategic fit and investment criteria.",
              features: ["AI-driven matching", "Strategic alignment", "Investment preferences", "Due diligence support"]
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: "Secure Escrow",
              description: "Blockchain-based escrow system ensures secure, transparent, and automated deal execution with smart contract integration.",
              features: ["Smart contracts", "Multi-signature security", "Automated milestones", "Transparent tracking"]
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: "Due Diligence Tools",
              description: "Comprehensive due diligence platform with document management, verification tools, and compliance tracking.",
              features: ["Document verification", "Compliance checks", "Risk analysis", "Audit trails"]
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: "Expert Advisory",
              description: "Access to experienced M&A advisors, legal experts, and industry specialists throughout your deal journey.",
              features: ["M&A expertise", "Legal guidance", "Industry insights", "Strategic consulting"]
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Fast-Track Processing",
              description: "Streamlined workflows and automated processes reduce deal timelines from months to weeks with maintained quality.",
              features: ["Automated workflows", "Quick approvals", "Real-time updates", "Milestone tracking"]
            }
          ].map((service, index) => (
            <div 
              key={index}
              className="group cursor-pointer animate-fadeInUp"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                    {service.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Learn More Link */}
                  <div className="pt-2">
                    <span className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-300">
                      Learn more
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works Section */}
    <section id="how-it-works" className="min-h-screen bg-blue-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            How It{' '}
            <span className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl text-white text-2xl font-bold mx-2 transform rotate-12 hover:rotate-[30deg] hover:scale-110 transition-all duration-500 animate-float">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From discovery to deal completion in four simple steps, powered by AI and secured by blockchain technology.
          </p>
        </div>

        {/* Detailed Process */}
        <div className="space-y-24">
          {[
            {
              step: "01",
              title: "Discovery & Listing",
              subtitle: "Find or List Your Perfect Match",
              description: "Browse our curated marketplace of Web3 companies or list your own. Our AI-powered platform ensures only verified, high-quality opportunities make it to market.",
              features: [
                "AI-powered company matching",
                "Comprehensive vetting process", 
                "Real-time market analytics",
                "Anonymous browsing options"
              ],
              icon: (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )
            },
            {
              step: "02",
              title: "Smart Matching",
              subtitle: "AI Connects the Right Parties",
              description: "Our intelligent algorithm analyzes strategic fit, financial alignment, and growth potential to connect qualified buyers with suitable sellers.",
              features: [
                "Strategic alignment analysis",
                "Financial compatibility scoring",
                "Industry expertise matching",
                "Investment criteria filtering"
              ],
              icon: (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            },
            {
              step: "03",
              title: "Due Diligence",
              subtitle: "Secure & Transparent Verification",
              description: "Complete your due diligence process with our secure platform featuring document sharing, verification tools, and expert advisory support.",
              features: [
                "Encrypted document sharing",
                "Automated compliance checks",
                "Expert advisory access",
                "Risk assessment tools"
              ],
              icon: (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )
            },
            {
              step: "04",
              title: "Deal Execution",
              subtitle: "Smart Contract Completion",
              description: "Execute deals seamlessly with blockchain-based escrow, automated milestone tracking, and secure fund transfers through smart contracts.",
              features: [
                "Smart contract execution",
                "Automated milestone tracking",
                "Secure escrow services",
                "Instant fund transfers"
              ],
              icon: (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }
          ].map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 animate-fadeInUp ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`} style={{animationDelay: `${index * 200}ms`}}>
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{step.title}</h3>
                    <p className="text-lg text-blue-600 font-medium">{step.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  {step.description}
                </p>
                
                <ul className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 bg-white rounded-3xl shadow-xl flex items-center justify-center transform hover:scale-105 hover:rotate-3 transition-all duration-500 group cursor-pointer">
                  <div className="text-blue-500 group-hover:scale-110 group-hover:text-blue-600 transition-all duration-300">
                    {step.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "48hr", label: "Average Deal Time" },
              { value: "99.2%", label: "Success Rate" },
              { value: "$2.4B+", label: "Total Volume" },
              { value: "500+", label: "Deals Completed" }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* For Founders Section */}
    <section id="for-founders" className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            For{' '}
            <span className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl text-white text-2xl font-bold mx-2 transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 animate-float-delayed">
              Founders
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Exit your Web3 company with confidence. Get maximum value through our streamlined M&A process.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              title: "Maximum Valuation",
              description: "AI-powered valuations ensure you get the best price for your company based on real market data and growth projections.",
              benefits: ["Real-time market analysis", "Multiple valuation methods", "Growth factor optimization"]
            },
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Fast Exit Process",
              description: "Complete your exit in weeks, not months. Our streamlined process eliminates traditional M&A bottlenecks.",
              benefits: ["48-hour average deal time", "Automated workflows", "Expert guidance"]
            },
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: "Secure & Confidential",
              description: "Your sensitive information stays protected with blockchain-level security and anonymous deal negotiations.",
              benefits: ["End-to-end encryption", "Anonymous listings", "Secure data rooms"]
            },
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: "Qualified Buyers Only",
              description: "Connect with pre-vetted, serious acquirers who have the capital and strategic interest in your sector.",
              benefits: ["Verified buyer credentials", "Strategic fit analysis", "Financial capability checks"]
            }
          ].map((benefit, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">{benefit.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{benefit.description}</p>
              <ul className="space-y-2">
                {benefit.benefits.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-green-50 rounded-3xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Exit?</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join successful founders who've achieved premium exits through our platform. Get your valuation today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95">
              Get Free Valuation
            </button>
            <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-green-600 hover:text-white transition-all duration-300 transform hover:scale-105">
              List Your Company
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* For Acquirers Section */}
    <section id="for-acquirers" className="min-h-screen bg-blue-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            For{' '}
            <span className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl text-white text-2xl font-bold mx-2 transform rotate-12 hover:rotate-[30deg] hover:scale-110 transition-all duration-500 animate-float">
              Acquirers
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover high-growth Web3 companies ready for acquisition. Access vetted deals with complete transparency.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: "Curated Deal Flow",
              description: "Access pre-vetted, high-quality Web3 companies across DeFi, NFTs, Gaming, and Infrastructure sectors.",
              benefits: ["Verified financials", "Growth trajectory analysis", "Market position assessment"]
            },
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
              title: "Strategic Matching",
              description: "Our AI identifies companies that align with your investment thesis and strategic objectives.",
              benefits: ["Investment criteria matching", "Synergy identification", "Risk-return optimization"]
            },
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Complete Transparency",
              description: "Full access to financials, metrics, and due diligence materials in our secure data rooms.",
              benefits: ["Real-time analytics", "Historical performance", "Future projections"]
            },
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Efficient Process",
              description: "Complete acquisitions faster with our streamlined workflow and smart contract execution.",
              benefits: ["Automated workflows", "Digital signatures", "Instant settlements"]
            }
          ].map((benefit, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">{benefit.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{benefit.description}</p>
              <ul className="space-y-2">
                {benefit.benefits.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Deal Categories */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Available Deal Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                category: "DeFi", 
                count: "45+", 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              { 
                category: "NFTs", 
                count: "32+", 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                category: "Gaming", 
                count: "28+", 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )
              },
              { 
                category: "Infrastructure", 
                count: "38+", 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                )
              }
            ].map((cat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                <div className="flex justify-center mb-3 text-purple-500">
                  {cat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{cat.count}</div>
                <div className="text-sm text-gray-600">{cat.category} Deals</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-3xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Start Acquiring</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Access exclusive Web3 deals and grow your portfolio with strategic acquisitions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95">
              Browse Deals
            </button>
            <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-white rounded transform rotate-45 flex items-center justify-center transition-all duration-300 group-hover:rotate-[60deg] group-hover:scale-110">
                <span className="text-gray-900 text-xs font-bold transform -rotate-45 group-hover:-rotate-[60deg] transition-transform duration-300">V</span>
              </div>
              <span className="text-xl font-bold">Valyra</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The future of Web3 M&A. Connecting founders with acquirers through AI-powered matching and blockchain security.
            </p>
            <div className="flex space-x-4">
              {['Twitter', 'LinkedIn', 'Discord'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                  <span className="text-xs">{social.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2">
              {['Browse Deals', 'List Company', 'Valuations', 'Due Diligence'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Documentation', 'API', 'Blog', 'Help Center'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 Valyra. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm">Powered by</span>
            <div className="flex space-x-4">
              {['Fetch.ai', 'ICP', 'Rust'].map((tech) => (
                <span key={tech} className="text-gray-400 text-sm hover:text-white transition-colors duration-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default HeroSection;