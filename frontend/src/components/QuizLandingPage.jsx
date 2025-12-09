import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuizLandingPage = () => {
  const navigate = useNavigate();

  const floatingOptions = [
    { id: 'A', text: 'How is the fit?', position: 'top-6 right-8' },
    { id: 'B', text: 'Do you like the design?', position: 'top-28 right-2' },
    { id: 'C', text: 'What would you recommend?', position: 'top-52 right-12' },
    { id: 'D', text: 'Is it comfortable?', position: 'bottom-12 right-6' }
  ];

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #dff1ec 0%, #cfe9e3 100%)'
      }}
    >
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20">
            {/* Heading */}
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light leading-tight mb-6 text-gray-800"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Let's Find Out Where<br />You Stand
            </h1>
            
            {/* Subtitle */}
            <p 
              className="text-lg sm:text-xl lg:text-2xl mb-10 text-gray-500 italic"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Don't worry, this quiz won't bite. But it might expose your overthinking 😌.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/quiz')}
                className="px-8 py-4 bg-teal-600 text-white rounded-full font-semibold text-base hover:bg-teal-700 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Start Quiz
              </button>
              <button
                onClick={() => {/* View results logic */}}
                className="px-8 py-4 bg-teal-700 text-white rounded-full font-semibold text-base hover:bg-teal-800 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                View Previous Results (7)
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - Image with Floating Options */}
          <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-16">
            <div className="relative w-full max-w-lg">
              {/* Main Image Container */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/quiz-hero.jpg"
                  alt="Quiz illustration"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Option Bubbles */}
              {floatingOptions.map((option) => (
                <div
                  key={option.id}
                  className={`absolute ${option.position} hidden lg:flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="flex-shrink-0 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {option.id}
                  </div>
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap pr-1">
                    {option.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuizLandingPage;
