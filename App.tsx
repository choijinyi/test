
import React, { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import LoginScreen from './components/LoginScreen';
import StartScreen from './components/StartScreen';
import TestScreen from './components/TestScreen';
import ResultsScreen from './components/ResultsScreen';
import MyResultsScreen from './components/MyResultsScreen';
import AdminDashboard from './components/AdminDashboard';
import type { Answers, Scores, UserInfo } from './types';
import { questions } from './constants';

const ADMIN_EMAIL = 'admin@oikos.edu';

type AppStep = 'login' | 'start' | 'test' | 'results' | 'myResults' | 'admin';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('login');
  const [scores, setScores] = useState<Scores | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleLogin = useCallback((info: UserInfo) => {
    setUserInfo(info);
    if (info.email === ADMIN_EMAIL) {
      setStep('admin');
    } else {
      setStep('myResults');
    }
  }, []);

  const handleStart = useCallback(() => {
    setStep('test');
  }, []);

  const handleSubmit = useCallback((finalAnswers: Answers) => {
    const totalScores: Scores = { D: 0, I: 0, S: 0, C: 0 };
    Object.values(finalAnswers).forEach(answer => {
      totalScores.D += answer.D || 0;
      totalScores.I += answer.I || 0;
      totalScores.S += answer.S || 0;
      totalScores.C += answer.C || 0;
    });
    setScores(totalScores);
    setStep('results');
  }, []);

  const handleReset = useCallback(() => {
    setScores(null);
    setStep('myResults');
  }, []);

  const handleSaveResult = useCallback(async (profileName: string) => {
    if (!userInfo || !scores) return;
    try {
      await addDoc(collection(db, 'results'), {
        email: userInfo.email,
        name: userInfo.name,
        scores,
        profileName,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('결과 저장 실패:', error);
    }
  }, [userInfo, scores]);

  const handleGoToMyResults = useCallback(() => {
    setScores(null);
    setStep('myResults');
  }, []);

  const handleLogout = useCallback(() => {
    setUserInfo(null);
    setScores(null);
    setStep('login');
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'start':
        return <StartScreen onStart={handleStart} />;
      case 'test':
        return <TestScreen questions={questions} onSubmit={handleSubmit} />;
      case 'results':
        return scores ? (
          <ResultsScreen
            scores={scores}
            onReset={handleReset}
            onSaveResult={handleSaveResult}
            onMyResults={handleGoToMyResults}
          />
        ) : (
          <div className="text-center p-8">결과를 불러오는 중 오류가 발생했습니다.</div>
        );
      case 'myResults':
        return userInfo ? (
          <MyResultsScreen
            email={userInfo.email}
            onStartTest={handleStart}
            onLogout={handleLogout}
          />
        ) : (
          <LoginScreen onLogin={handleLogin} />
        );
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 text-slate-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default App;
