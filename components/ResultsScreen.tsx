
import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { Scores, DISCType } from '../types';
import { profiles, discDescriptions } from '../constants';
import { getProfileName } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResultsScreenProps {
  scores: Scores;
  onReset: () => void;
  onSaveResult?: (profileName: string) => Promise<void>;
  onMyResults?: () => void;
}

declare const html2canvas: any;
declare namespace jspdf {
  class jsPDF {
    constructor(options?: any);
    addImage(imageData: string | HTMLCanvasElement, format: string, x: number, y: number, width: number, height: number, alias?: string, compression?: string, rotation?: number): this;
    save(filename: string): this;
    internal: {
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
      }
    };
  }
}


const ResultsScreen: React.FC<ResultsScreenProps> = ({ scores, onReset, onSaveResult, onMyResults }) => {
  const [saved, setSaved] = useState(false);

  const { profile, highestTypes } = useMemo(() => {
    const sortedScores = (Object.keys(scores) as DISCType[]).sort((a, b) => scores[b] - scores[a]);
    const profileName = getProfileName(scores);
    const foundProfile = { name: profileName };

    return { profile: foundProfile, highestTypes: sortedScores.slice(0, 2) };
  }, [scores]);

  useEffect(() => {
    if (!saved && onSaveResult) {
      setSaved(true);
      onSaveResult(profile.name);
    }
  }, [saved, onSaveResult, profile.name]);

  const chartData = useMemo(() => {
    return [
      { name: 'D (주도형)', value: scores.D, fill: '#ef4444' },
      { name: 'I (사교형)', value: scores.I, fill: '#f97316' },
      { name: 'S (안정형)', value: scores.S, fill: '#22c55e' },
      { name: 'C (신중형)', value: scores.C, fill: '#3b82f6' },
    ];
  }, [scores]);

  const resultsRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!resultsRef.current || isDownloading) return;

    const elementToCapture = resultsRef.current;
    const buttonsContainer = elementToCapture.querySelector('#result-buttons') as HTMLElement | null;

    setIsDownloading(true);

    if (buttonsContainer) {
        buttonsContainer.style.visibility = 'hidden';
    }

    try {
        const canvas = await html2canvas(elementToCapture, {
            scale: 2, // Higher resolution for better quality
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let imageWidth = pdfWidth;
        let imageHeight = imageWidth / ratio;

        if (imageHeight > pdfHeight) {
            imageHeight = pdfHeight;
            imageWidth = imageHeight * ratio;
        }

        const x = (pdfWidth - imageWidth) / 2;
        const y = 0;

        pdf.addImage(imgData, 'PNG', x, y, imageWidth, imageHeight);
        pdf.save('DISC_Test_Results.pdf');
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("PDF를 생성하는 데 실패했습니다. 다시 시도해주세요.");
    } finally {
        if (buttonsContainer) {
            buttonsContainer.style.visibility = 'visible';
        }
        setIsDownloading(false);
    }
  };


  return (
    <div ref={resultsRef} className="p-4 sm:p-8 bg-white rounded-2xl shadow-xl animate-fade-in-up">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 text-center">검사 결과</h1>
      <div className="text-center mb-8">
        <p className="text-xl text-slate-600">당신의 행동 유형 프로파일은</p>
        <p className="text-4xl font-bold text-blue-600 mt-2">{profile.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-50 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">점수</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 60]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="점수" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl">
           <h2 className="text-2xl font-bold text-slate-800 mb-4">주요 행동 유형 특성</h2>
           <div className="space-y-6">
                {highestTypes.map(type => (
                    <div key={type}>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">{discDescriptions[type].title}</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                            {discDescriptions[type].points.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                ))}
           </div>
        </div>
      </div>

      <div id="result-buttons" className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isDownloading ? '다운로드 중...' : 'PDF로 결과 다운로드'}
        </button>
        {onMyResults && (
          <button
            onClick={onMyResults}
            className="px-10 py-4 bg-purple-600 text-white font-bold text-lg rounded-full hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg"
          >
            내 결과 보기
          </button>
        )}
        <button
          onClick={onReset}
          className="px-10 py-4 bg-slate-600 text-white font-bold text-lg rounded-full hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-300 shadow-lg"
        >
          다시 검사하기
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
