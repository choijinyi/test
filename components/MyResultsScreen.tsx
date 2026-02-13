import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { TestResult } from '../types';

interface MyResultsScreenProps {
  email: string;
  onStartTest: () => void;
  onLogout: () => void;
}

const MyResultsScreen: React.FC<MyResultsScreenProps> = ({ email, onStartTest, onLogout }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const q = query(
          collection(db, 'results'),
          where('email', '==', email),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TestResult[];
        setResults(data);
      } catch (error) {
        console.error('결과 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl text-slate-500">결과를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-white rounded-2xl shadow-xl animate-fade-in-up">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-2 text-center">내 검사 결과</h1>
      <p className="text-center text-slate-500 mb-8">{email}</p>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-slate-500 mb-6">아직 검사 결과가 없습니다.</p>
          <button
            onClick={onStartTest}
            className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
          >
            검사 시작하기
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {results.map((result) => {
              const date = result.createdAt?.toDate
                ? result.createdAt.toDate().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '날짜 없음';

              return (
                <div
                  key={result.id}
                  className="bg-gradient-to-br from-slate-50 to-purple-50 p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">{result.profileName}</span>
                    <span className="text-sm text-slate-400">{date}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xs text-red-500 font-semibold">D</div>
                      <div className="text-lg font-bold text-red-600">{result.scores.D}</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xs text-orange-500 font-semibold">I</div>
                      <div className="text-lg font-bold text-orange-600">{result.scores.I}</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-green-500 font-semibold">S</div>
                      <div className="text-lg font-bold text-green-600">{result.scores.S}</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-500 font-semibold">C</div>
                      <div className="text-lg font-bold text-blue-600">{result.scores.C}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartTest}
              className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
            >
              새 검사 시작
            </button>
            <button
              onClick={onLogout}
              className="px-10 py-4 bg-slate-600 text-white font-bold text-lg rounded-full hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-300 shadow-lg"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyResultsScreen;
