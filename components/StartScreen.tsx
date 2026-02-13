
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl animate-fade-in-up transition-transform transform hover:scale-[1.02] duration-300">
        <div className="inline-block mb-4 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
          <span className="text-sm font-medium text-purple-100 tracking-wide">행동유형 진단 도구</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">DISC 행동유형 평가서</h1>
        <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          각 문항에서 나를 가장 잘 설명하는 순서대로 4점, 3점, 2점, 1점을 부여하여 자신의 행동 유형을 알아보세요.
        </p>
        <button
          onClick={onStart}
          className="px-10 py-4 bg-white text-purple-700 font-bold text-lg rounded-full hover:bg-purple-50 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/40 shadow-lg"
        >
          검사 시작하기
        </button>
        <p className="mt-6 text-sm text-purple-200">제작 : OIKOS Univ. 최진이교수</p>
      </div>
    </div>
  );
};

export default StartScreen;
