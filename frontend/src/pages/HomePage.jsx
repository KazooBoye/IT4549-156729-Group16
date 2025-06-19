import React from 'react';
import gymBackground from '../assets/images/gym-background.jpg';
import NavButtons from '../components/Common/NavButtons'; // Đường dẫn tùy theo cấu trúc dự án bạn

const HomePage = () => {
  return (
    <>
      {/* Fullscreen background image */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${gymBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -2,
        }}
      />
      {/* Dark overlay for readability */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20, 20, 30, 0.7)',
          zIndex: -1,
        }}
      />

      {/* Content overlay */}
      <div
        className="min-h-screen flex flex-col justify-center items-center text-gray-100 px-6 py-12"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div
          className="bg-gray-900 bg-opacity-80 p-8 rounded-lg max-w-xl text-center shadow-2xl
            transform transition-transform duration-700 ease-in-out
            hover:scale-105
            sm:p-12
            md:p-16"
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 animate-fadeInDown"
            style={{
              background: 'linear-gradient(90deg, #fffbe6 0%, #ffe066 40%, #ffd700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 24px rgba(255, 255, 200, 0.7), 0 1px 2px #fff',
              letterSpacing: '2px',
              fontWeight: 900,
            }}
          >
            Welcome to Gym Management System
          </h1>
          <p className="mb-10 text-base sm:text-lg md:text-xl text-gray-300 animate-fadeInUp">
            Your one-stop solution for managing your gym operations efficiently.
          </p>

        </div>
      </div>

      {/* Custom animation styles and button hover effects */}
      <style>{`
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        /* Hover effects cho NavButtons sẽ được xử lý trong NavButtons.jsx */
      `}</style>
    </>
  );
};

export default HomePage;