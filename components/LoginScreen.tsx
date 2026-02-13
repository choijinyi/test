import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserInfo } from '../types';

interface LoginScreenProps {
  onLogin: (userInfo: UserInfo) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'users'), {
        name: trimmedName,
        email: trimmedEmail,
        createdAt: serverTimestamp(),
      });
      onLogin({ name: trimmedName, email: trimmedEmail });
    } catch (err) {
      console.error('Failed to save user info:', err);
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 sm:p-12 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
            <span className="text-sm font-medium text-purple-100 tracking-wide">행동유형 진단 도구</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
            DISC 행동유형 평가서
          </h1>
          <p className="text-purple-100 text-sm">
            시작하기 전에 이름과 이메일을 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-100 mb-1">
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-purple-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-purple-100 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-purple-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-200 text-sm text-center bg-red-500/20 rounded-lg py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-10 py-4 bg-white text-purple-700 font-bold text-lg rounded-full hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/40 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? '처리 중...' : '시작하기'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-purple-200">제작 : OIKOS Univ. 최진이교수</p>
      </div>
    </div>
  );
};

export default LoginScreen;
