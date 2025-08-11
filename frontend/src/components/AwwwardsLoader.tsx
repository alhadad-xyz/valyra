import React, { useState, useEffect } from 'react';

interface AwwwardsLoaderProps {
  onComplete: () => void;
}

const AwwwardsLoader: React.FC<AwwwardsLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(() => {
              setIsExiting(true);
              setTimeout(() => {
                onComplete();
              }, 1000);
            }, 500);
          }, 300);
          return 100;
        }
        
        // Simulate realistic loading with varying speeds
        const increment = Math.random() * 3 + 1;
        const newProgress = Math.min(prev + increment, 100);
        
        // Slow down near the end for dramatic effect
        if (newProgress > 90) {
          return prev + 0.5;
        }
        
        return newProgress;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-1000 ${
        isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main loader content */}
      <div className="relative z-10 text-center">
        {/* Logo animation */}
        <div className={`mb-16 transition-all duration-1000 ${isComplete ? 'scale-125 opacity-90' : 'scale-100 opacity-100'}`}>
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-12 h-12 bg-white rounded transform rotate-45 flex items-center justify-center transition-all duration-1000 ${
              isComplete ? 'rotate-[405deg] scale-110' : 'rotate-45 scale-100'
            }`}>
              <span className={`text-black text-lg font-bold transform -rotate-45 transition-all duration-1000 ${
                isComplete ? '-rotate-[405deg]' : '-rotate-45'
              }`}>V</span>
            </div>
            <span className="text-white text-3xl font-bold tracking-wider">Valyra</span>
          </div>
        </div>

        {/* Progress counter */}
        <div className="mb-12">
          <div className={`text-6xl md:text-8xl font-light text-white mb-4 transition-all duration-300 ${
            isComplete ? 'scale-110 text-blue-400' : 'scale-100'
          }`}>
            <span className="tabular-nums">
              {Math.floor(progress).toString().padStart(2, '0')}
            </span>
            <span className="text-3xl md:text-4xl ml-2">%</span>
          </div>
          <div className="text-white/70 text-sm tracking-widest uppercase">
            {progress < 30 && "Loading Experience"}
            {progress >= 30 && progress < 60 && "Crafting Interface"}
            {progress >= 60 && progress < 90 && "Preparing Magic"}
            {progress >= 90 && progress < 100 && "Almost Ready"}
            {progress === 100 && "Welcome"}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-80 mx-auto">
          <div className="h-px bg-white/20 relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-white via-blue-400 to-white transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
              }}
            />
            {/* Animated glow effect */}
            <div 
              className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
              style={{ left: `${Math.max(0, progress - 20)}%` }}
            />
          </div>
          
          {/* Progress markers */}
          <div className="flex justify-between mt-2 text-white/30 text-xs">
            <span>00</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Completion animation */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-white/30 rounded-full animate-pulse">
              <div className="w-full h-full border-4 border-transparent border-t-white rounded-full animate-spin-slow" />
            </div>
          </div>
        )}
      </div>

      {/* Curtain reveal effect */}
      {isExiting && (
        <>
          <div className="absolute inset-0 bg-black animate-curtain-left" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          <div className="absolute inset-0 bg-black animate-curtain-right" style={{ clipPath: 'inset(0 0 0 50%)' }} />
        </>
      )}
    </div>
  );
};

export default AwwwardsLoader;