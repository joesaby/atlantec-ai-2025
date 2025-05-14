import React, { useState, useEffect } from "react";
import ChatAvatar from "./ChatAvatar";

const ChatWithBloom = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Safe check for browser environment
    if (typeof window !== 'undefined') {
      // Initial check of scroll position
      const initialCheck = () => {
        if (window.scrollY > 300) {
          setIsVisible(true);
        }
      };
      
      // Run initial check
      initialCheck();
      
      // Show after 8 seconds regardless of scroll
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 8000);
      
      // Function to handle scroll events with debounce for better performance
      let scrollTimeout;
      const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (window.scrollY > 300) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }, 50); // Small debounce delay
      };

      // Add scroll event listener
      window.addEventListener('scroll', handleScroll);

      // Clean up
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timer);
        if (scrollTimeout) clearTimeout(scrollTimeout);
      };
    }
  }, []);

  const handleClick = () => {
    // Navigate to gardening agent page
    if (typeof window !== 'undefined') {
      window.location.href = '/gardening-agent';
    }
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <div className="chat chat-end">
        <div 
          className="chat-bubble chat-bubble-bloom flex items-center gap-3 cursor-pointer transition-all" 
          onClick={handleClick}
        >
          <div>
            <p className="font-semibold">Hi! I'm Bloom, your garden assistant</p>
            <p className="text-sm opacity-80">Ask me anything about gardening in Ireland</p>
          </div>
          <div className="flex-shrink-0">
            <ChatAvatar type="assistant" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithBloom;