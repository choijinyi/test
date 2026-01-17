import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 text-white p-4 text-center mt-8">
      <div className="container mx-auto">
        <p>&copy; {currentYear} 대학 도서관 좌석 예약. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
