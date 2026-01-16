import React, { useState, useEffect } from 'react';

/**
 * AddToHomeScreen Component
 * 
 * Displays platform-specific instructions for adding the PWA to home screen.
 * Shows on first visit for mobile users (iOS/Android) and can be dismissed.
 * 
 * @component
 */
const AddToHomeScreen = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('addToHomeScreenDismissed');
    if (dismissed) {
      return;
    }

    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');

    // Only show if mobile and not already installed
    if ((isIOS || isAndroid) && !isStandalone) {
      setPlatform(isIOS ? 'ios' : 'android');
      // Small delay to ensure smooth page load
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('addToHomeScreenDismissed', 'true');
  };

  if (!showPrompt || !platform) {
    return null;
  }

  const isIOS = platform === 'ios';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none"
      style={{ 
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 pointer-events-auto"
        onClick={handleDismiss}
      />
      
      {/* Popup Card */}
      <div 
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl w-full max-w-md border border-amber-500/30 shadow-2xl pointer-events-auto animate-slide-up"
        style={{ 
          animation: 'slide-up 0.4s ease-out forwards',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all z-10"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-3xl">📱</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-light text-white text-center mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Add to Home Screen
          </h3>
          <p className="text-white/60 text-sm text-center mb-6">
            Install this app for quick access and a better experience
          </p>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            {isIOS ? (
              <>
                {/* iOS Instructions */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">Tap the Share button</p>
                    <p className="text-white/50 text-xs">
                      Look for the <span className="text-amber-400 font-mono">□↗</span> icon at the bottom of your Safari browser
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">Scroll and tap "Add to Home Screen"</p>
                    <p className="text-white/50 text-xs">
                      You'll see this option in the share menu
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">Confirm and enjoy!</p>
                    <p className="text-white/50 text-xs">
                      The app will appear on your home screen like a native app
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Android Instructions */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">Tap the Menu button</p>
                    <p className="text-white/50 text-xs">
                      Look for the <span className="text-amber-400 font-mono">⋮</span> or <span className="text-amber-400 font-mono">☰</span> icon in your browser
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">Select "Add to Home screen" or "Install app"</p>
                    <p className="text-white/50 text-xs">
                      You may see a banner at the top of the page, or find it in the menu
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">Confirm and enjoy!</p>
                    <p className="text-white/50 text-xs">
                      The app will be installed and appear on your home screen
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium text-sm transition-all duration-300"
          >
            Got it, thanks!
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AddToHomeScreen;
