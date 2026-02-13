
import React, { useState, useMemo, useCallback } from 'react';
import type { Question, Answers, Answer, DISCType } from '../types';
import { ALL_SCORES } from '../types';

interface QuestionRowProps {
  question: Question;
  questionIndex: number;
  onAnswerChange: (index: number, answer: Answer) => void;
  initialAnswer: Answer;
}

const QuestionRow: React.FC<QuestionRowProps> = ({ question, questionIndex, onAnswerChange, initialAnswer }) => {
  const [currentAnswer, setCurrentAnswer] = useState<Answer>(initialAnswer);

  const handleSelectChange = (type: DISCType, value: string) => {
    const score = value ? parseInt(value, 10) : 0;
    const newAnswer = { ...currentAnswer, [type]: score };

    // Ensure scores are unique
    // Fix: Add type check to ensure `s` is a number before comparison.
    const usedScores = Object.values(newAnswer).filter(s => typeof s === 'number' && s > 0);
    const hasDuplicates = new Set(usedScores).size !== usedScores.length;
    
    if (hasDuplicates) {
        // Simple reset if duplicate is selected - find the other key with same score and unset it
        for (const key in newAnswer) {
            if (key !== type && newAnswer[key as DISCType] === score) {
                newAnswer[key as DISCType] = 0;
            }
        }
    }

    setCurrentAnswer(newAnswer);
    onAnswerChange(questionIndex, newAnswer);
  };

  const selectedScores = useMemo(() => new Set(Object.values(currentAnswer).filter(Boolean)), [currentAnswer]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6 transition-shadow hover:shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{questionIndex + 1}. {question.category}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(question.options) as DISCType[]).map((type) => (
          <div key={type} className="flex items-center space-x-3">
            <select
              value={currentAnswer[type] || ''}
              onChange={(e) => handleSelectChange(type, e.target.value)}
              className="w-20 p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">선택</option>
              {ALL_SCORES.map(score => (
                <option 
                  key={score} 
                  value={score} 
                  disabled={selectedScores.has(score) && currentAnswer[type] !== score}
                  className="disabled:bg-slate-200"
                >
                  {score}점
                </option>
              ))}
            </select>
            <label className="text-slate-700 flex-1">{question.options[type]}</label>
          </div>
        ))}
      </div>
    </div>
  );
};


interface TestScreenProps {
  questions: Question[];
  onSubmit: (answers: Answers) => void;
}

const TestScreen: React.FC<TestScreenProps> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState<Answers>({});
  
  const handleAnswerChange = useCallback((index: number, answer: Answer) => {
    setAnswers(prev => ({ ...prev, [index]: answer }));
  }, []);

  const allAnswered = useMemo(() => {
    if (Object.keys(answers).length !== questions.length) return false;
    return Object.values(answers).every(answer => {
      const scores = Object.values(answer).filter(s => s && s > 0);
      return scores.length === 4 && new Set(scores).size === 4;
    });
  }, [answers, questions.length]);
  
  const progress = useMemo(() => {
    const answeredCount = Object.values(answers).filter(answer => 
        Object.values(answer).filter(s => s && s > 0).length === 4
    ).length;
    return (answeredCount / questions.length) * 100;
  }, [answers, questions.length]);

  return (
    <div className="animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 text-center">DISC 행동유형 검사</h1>
        <p className="text-slate-600 mb-6 text-center">각 항목별로 4개의 보기에 4, 3, 2, 1점을 중복되지 않게 부여해주세요.</p>

        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-8">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
        </div>
      
      {questions.map((q, index) => (
        <QuestionRow 
          key={index}
          question={q}
          questionIndex={index}
          onAnswerChange={handleAnswerChange}
          initialAnswer={answers[index] || {}}
        />
      ))}
      <div className="mt-8 text-center">
        <button
          onClick={() => onSubmit(answers)}
          disabled={!allAnswered}
          className="px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          결과 보기
        </button>
        {!allAnswered && <p className="mt-4 text-sm text-red-600">모든 문항에 답변을 완료해주세요.</p>}
      </div>
    </div>
  );
};

export default TestScreen;
