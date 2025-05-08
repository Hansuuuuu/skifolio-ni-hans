import React, { useState,useEffect,useRef } from 'react';


import { ChevronLeft, ChevronRight, Move, X, Check, Mail } from 'lucide-react';

const Terms = ({ onClose, onAgree }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [dragDistance, setDragDistance] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const slideContainerRef = useRef(null);
    const effectiveDate = "November 15, 2024";
  
    // Terms sections content
    const sections = [
      {
        title: "1. Acceptance of Terms",
        content: "By accessing or using Skifolio, you agree to be bound by these Terms and Conditions. If you do not agree, please do not register, use, or access our services."
      },
      {
        title: "2. Account Eligibility",
        content: "You must be at least 13 years old to create an account. Employers must submit valid business documents to verify company identity."
      },
      {
        title: "3. Account Responsibilities",
        content: "You are responsible for maintaining the security of your account.",
        list: [
          "Keep your login credentials secure and confidential.",
          "Immediately report unauthorized access or breaches.",
          "You are responsible for all activities that occur under your account."
        ]
      },
      {
        title: "4. User Conduct",
        content: "You agree not to:",
        list: [
          "Upload false or misleading information.",
          "Use Skifolio for unlawful or abusive purposes.",
          "Violate intellectual property rights of others."
        ]
      },
      {
        title: "5. Content Ownership",
        content: "All content you upload remains your intellectual property. By submitting content to Skifolio, you grant us a license to display and share it within the scope of the platform's purpose."
      },
      {
        title: "6. Employer Verification",
        content: "Employers must upload valid business permits and company details. These documents are reviewed and stored securely for verification purposes."
      },
      {
        title: "7. Account Approval",
        content: "All accounts are subject to verification and approval. Skifolio reserves the right to reject or suspend accounts that do not meet platform standards or violate these terms."
      },
      {
        title: "8. Termination",
        content: "We may suspend or terminate your account for violations of these Terms, misuse of the platform, or at our discretion with or without prior notice."
      },
      {
        title: "9. Limitation of Liability",
        content: "Skifolio is provided \"as is\" and we make no warranties regarding its accuracy, security, or availability. We are not liable for any indirect or consequential damages arising from the use of our platform."
      },
      {
        title: "10. Changes to Terms",
        content: "We may revise these Terms at any time. Continued use of Skifolio constitutes acceptance of the updated terms. We encourage users to review this page regularly."
      },
      {
        title: "11. Contact Us",
        content: "For questions or concerns regarding these Terms, please contact us at support@skifolio.com.",
        hasEmail: true
      }
    ];
  
    // Check if on the final slide
    const isLastSection = currentSection === sections.length - 1;
    
    // Handle section navigation
    const goToSection = (index) => {
      setShowAnimation(true);
      setCurrentSection(index);
      setTimeout(() => setShowAnimation(false), 700);
    };
    
    const nextSection = () => {
      if (currentSection < sections.length - 1) {
        goToSection(currentSection + 1);
      }
    };
    
    const prevSection = () => {
      if (currentSection > 0) {
        goToSection(currentSection - 1);
      }
    };
  
    // Touch event handlers for swipe
    const handleTouchStart = (e) => {
      setTouchStart(e.targetTouches[0].clientX);
      setIsDragging(true);
      setDragDistance(0);
    };
  
    const handleTouchMove = (e) => {
      if (!touchStart) return;
      
      const currentTouch = e.targetTouches[0].clientX;
      setTouchEnd(currentTouch);
      
      // Calculate drag distance for visual feedback
      const distance = currentTouch - touchStart;
      setDragDistance(distance);
    };
  
    const handleTouchEnd = () => {
      setIsDragging(false);
      
      if (!touchStart || !touchEnd) return;
      
      const distance = touchEnd - touchStart;
      const isLeftSwipe = distance < -70;
      const isRightSwipe = distance > 70;
      
      if (isLeftSwipe && currentSection < sections.length - 1) {
        nextSection();
      } else if (isRightSwipe && currentSection > 0) {
        prevSection();
      }
      
      // Reset values
      setTouchStart(null);
      setTouchEnd(null);
      setDragDistance(0);
    };
  
    // Mouse event handlers for drag
    const handleMouseDown = (e) => {
      setTouchStart(e.clientX);
      setIsDragging(true);
      setDragDistance(0);
      
      // Disable text selection during drag
      document.body.style.userSelect = 'none';
    };
  
    const handleMouseMove = (e) => {
      if (!touchStart || !isDragging) return;
      
      const currentPosition = e.clientX;
      setTouchEnd(currentPosition);
      
      // Calculate drag distance for visual feedback
      const distance = currentPosition - touchStart;
      setDragDistance(distance);
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      
      if (!touchStart || !touchEnd) return;
      
      const distance = touchEnd - touchStart;
      const isLeftSwipe = distance < -70;
      const isRightSwipe = distance > 70;
      
      if (isLeftSwipe && currentSection < sections.length - 1) {
        nextSection();
      } else if (isRightSwipe && currentSection > 0) {
        prevSection();
      }
      
      // Reset values
      setTouchStart(null);
      setTouchEnd(null);
      setDragDistance(0);
    };
  
    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextSection();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          prevSection();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSection]);
  
    return (
      <div className="flex flex-col w-full max-w-2xl bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-5">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Terms and Conditions</h3>
            <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span className="text-sm font-medium">
                {currentSection + 1} / {sections.length}
              </span>
            </div>
          </div>
          <p className="text-sm mt-2 opacity-80">
            Effective Date: {effectiveDate}
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
        
        {/* Content area */}
        <div 
          ref={slideContainerRef}
          className="relative flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="p-6 h-full"
            style={{ 
              transform: `translateX(${dragDistance}px)`,
              transition: isDragging ? 'none' : 'transform 300ms ease-out'
            }}
          >
            <div 
              className={`bg-white rounded-lg p-6 border border-gray-200 shadow-sm h-full ${
                showAnimation ? 'animate-pulse' : ''
              }`}
            >
              <h4 className="text-xl font-semibold text-indigo-800 mb-4 border-b pb-2 border-gray-100">
                {sections[currentSection].title}
              </h4>
              
              <div className="text-gray-700 text-base leading-relaxed mb-4">
                {sections[currentSection].content}
              </div>
              
              {sections[currentSection].list && (
                <ul className="my-4 space-y-2">
                  {sections[currentSection].list.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-indigo-500 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="ml-2 text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              
              {sections[currentSection].hasEmail && (
                <div className="mt-4 flex items-center">
                  <Mail size={18} className="text-indigo-600 mr-2" />
                  <a 
                    href="mailto:support@skifolio.com" 
                    className="inline-block text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-all"
                  >
                    support@skifolio.com
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Swipe indicator */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="flex items-center text-sm text-gray-500 bg-white bg-opacity-70 rounded-full px-3 py-1 shadow-sm">
              <Move size={16} className="mr-1" />
              <span>Swipe to navigate</span>
            </div>
          </div>
        </div>
        
        {/* Navigation dots */}
        <div className="flex justify-center p-3 bg-gray-50">
          <div className="flex space-x-1.5">
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSection(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSection 
                    ? 'bg-indigo-600 scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to section ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between p-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={prevSection}
            disabled={currentSection === 0}
            className={`px-4 py-2 rounded-full flex items-center transition-all ${
              currentSection === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <ChevronLeft size={18} className="mr-1" />
            Previous
          </button>
          
          <button
            onClick={nextSection}
            disabled={isLastSection}
            className={`px-4 py-2 rounded-full flex items-center transition-all ${
              isLastSection
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
        
        {/* Footer button area */}
        <div className="bg-white border-t border-gray-200 p-4 flex justify-between">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-full flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-colors"
          >
            <X size={18} className="mr-2" />
            Close
          </button>
          
          {isLastSection && (
            <button 
              onClick={onAgree}
              className="px-5 py-2 rounded-full flex items-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Check size={18} className="mr-2" />
              I Agree
            </button>
          )}
        </div>
        
        <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-100">
          © 2025 Skifolio. All rights reserved.
        </div>
      </div>
    );
  };
  export default Terms;