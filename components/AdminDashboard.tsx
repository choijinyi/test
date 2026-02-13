import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { TestResult } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        const q = query(
          collection(db, 'results'),
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
    fetchAllResults();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl text-slate-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-white rounded-2xl shadow-xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">관리자 대시보드</h1>
        <button
          onClick={onLogout}
          className="px-6 py-3 bg-slate-600 text-white font-bold rounded-full hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-300 shadow-lg"
        >
          로그아웃
        </button>
      </div>

      <p className="text-slate-500 mb-6">총 {results.length}개의 검사 결과</p>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-slate-500">아직 검사 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-4 font-semibold text-slate-700 rounded-tl-lg">이름</th>
                <th className="text-left p-4 font-semibold text-slate-700">이메일</th>
                <th className="text-left p-4 font-semibold text-slate-700">프로필</th>
                <th className="text-center p-4 font-semibold text-red-600">D</th>
                <th className="text-center p-4 font-semibold text-orange-600">I</th>
                <th className="text-center p-4 font-semibold text-green-600">S</th>
                <th className="text-center p-4 font-semibold text-blue-600">C</th>
                <th className="text-left p-4 font-semibold text-slate-700 rounded-tr-lg">날짜</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                const date = result.createdAt?.toDate
                  ? result.createdAt.toDate().toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '날짜 없음';

                return (
                  <tr
                    key={result.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="p-4 font-medium text-slate-800">{result.name}</td>
                    <td className="p-4 text-slate-600">{result.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {result.profileName}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-red-600">{result.scores.D}</td>
                    <td className="p-4 text-center font-bold text-orange-600">{result.scores.I}</td>
                    <td className="p-4 text-center font-bold text-green-600">{result.scores.S}</td>
                    <td className="p-4 text-center font-bold text-blue-600">{result.scores.C}</td>
                    <td className="p-4 text-sm text-slate-500">{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
