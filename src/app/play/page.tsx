'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pause, Play, Volume2, VolumeX, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomQuestions } from '@/data/questions';
import { calculateScore, getStreakMessage } from '@/lib/scoring';
import { getPlayerStats, savePlayerStats, getSoundEnabled, setSoundEnabled } from '@/lib/storage';
import { Question, Tier, GameMode, TIMER_SETTINGS, QUESTIONS_PER_GAME } from '@/types';

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = (searchParams.get('mode') || 'classic') as GameMode;
  const tier = (searchParams.get('tier') || 'Fresh from the Oven') as Tier;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; userAnswer: number }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_SETTINGS[tier]);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundState] = useState(false);
  const [streakMessage, setStreakMessage] = useState<{ message: string; emoji: string } | null>(null);

  const isPractice = mode === 'practice';
  const totalTime = TIMER_SETTINGS[tier];
  const currentQuestion = questions[currentIndex];

  // Initialize game
  useEffect(() => {
    const gameQuestions = getRandomQuestions(tier, QUESTIONS_PER_GAME);
    setQuestions(gameQuestions);
    setSoundState(getSoundEnabled());
  }, [tier]);

  // Timer
  useEffect(() => {
    if (isPractice || isPaused || showResult || !currentQuestion) return;

    if (timeRemaining <= 0) {
      handleAnswer(-1); // Time's up
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((t) => t - 0.1);
    }, 100);

    return () => clearInterval(timer);
  }, [timeRemaining, isPaused, showResult, isPractice, currentQuestion]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (showResult || selectedAnswer !== null) return;

    const isCorrect = answerIndex === currentQuestion?.correct;
    const points = calculateScore(tier, timeRemaining, isCorrect, isPractice);

    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setScore((s) => s + points);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      const msg = getStreakMessage(newStreak);
      if (msg) {
        setStreakMessage(msg);
        setTimeout(() => setStreakMessage(null), 2000);
      }
    } else {
      setStreak(0);
    }

    setAnswers((a) => [...a, { correct: isCorrect, userAnswer: answerIndex }]);
  }, [showResult, selectedAnswer, currentQuestion, tier, timeRemaining, isPractice, streak, bestStreak]);

  const nextQuestion = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      // Game complete - save stats and redirect
      const stats = getPlayerStats();
      const correct = answers.filter(a => a.correct).length + (selectedAnswer === currentQuestion?.correct ? 1 : 0);

      stats.totalGames += 1;
      stats.totalCorrect += correct;
      stats.totalQuestions += questions.length;

      if (!stats.badges.includes('first_loaf')) {
        stats.badges.push('first_loaf');
      }

      if (correct === questions.length && !isPractice) {
        if (!stats.badges.includes('perfectionist')) {
          stats.badges.push('perfectionist');
        }
        if (tier === 'Master Baker' && !stats.badges.includes('star_baker')) {
          stats.badges.push('star_baker');
        }
      }

      if (bestStreak >= 10 && !stats.badges.includes('streak_master')) {
        stats.badges.push('streak_master');
      }

      if (!isPractice && score > stats.highScores[tier]) {
        stats.highScores[tier] = score;
      }

      savePlayerStats(stats);

      // Navigate to results
      const resultsData = {
        mode,
        tier,
        score: score + (selectedAnswer === currentQuestion?.correct ? calculateScore(tier, timeRemaining, true, isPractice) : 0),
        correct,
        total: questions.length,
        bestStreak: Math.max(bestStreak, streak + (selectedAnswer === currentQuestion?.correct ? 1 : 0)),
      };

      router.push(`/results?data=${encodeURIComponent(JSON.stringify(resultsData))}`);
      return;
    }

    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeRemaining(TIMER_SETTINGS[tier]);
  }, [currentIndex, questions.length, answers, selectedAnswer, currentQuestion, score, tier, timeRemaining, isPractice, bestStreak, streak, mode, router]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundState(newState);
    setSoundEnabled(newState);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍞</div>
          <p className="text-amber-900">Loading questions...</p>
        </div>
      </div>
    );
  }

  const timerPercentage = (timeRemaining / totalTime) * 100;
  const timerColor = timerPercentage > 50 ? 'bg-green-500' : timerPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-amber-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Quit</span>
          </Link>

          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase">{mode === 'practice' ? 'Practice' : 'Classic'}</p>
            <p className="font-semibold text-amber-900">{tier}</p>
          </div>

          <div className="flex items-center gap-3">
            {streak >= 3 && (
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-5 h-5" />
                <span className="font-bold">{streak}</span>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-gray-500">Score</p>
              <p className="font-bold text-amber-600">{score}</p>
            </div>
            <button onClick={toggleSound} className="p-2 hover:bg-amber-100 rounded-lg">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Timer Bar */}
        {!isPractice && (
          <div className="h-2 bg-gray-200">
            <motion.div
              className={`h-full ${timerColor} transition-colors`}
              initial={{ width: '100%' }}
              animate={{ width: `${timerPercentage}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}
      </header>

      {/* Progress Dots */}
      <div className="bg-white/50 py-3">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < currentIndex
                    ? answers[i]?.correct ? 'bg-green-500' : 'bg-red-500'
                    : i === currentIndex
                    ? 'bg-amber-500 ring-2 ring-amber-300 ring-offset-2'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Streak Message */}
      <AnimatePresence>
        {streakMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full shadow-lg"
          >
            <span className="text-2xl mr-2">{streakMessage.emoji}</span>
            <span className="font-bold">{streakMessage.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden"
        >
          <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex justify-between items-center">
            <span className="text-xs font-medium text-amber-700 bg-amber-200 px-2 py-1 rounded-full">
              {currentQuestion.category}
            </span>
            <span className="text-sm text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="grid gap-3">
              {currentQuestion.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                let buttonClass = 'border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50';

                if (showResult) {
                  if (i === currentQuestion.correct) {
                    buttonClass = 'border-2 border-green-500 bg-green-50 text-green-900';
                  } else if (i === selectedAnswer && i !== currentQuestion.correct) {
                    buttonClass = 'border-2 border-red-500 bg-red-50 text-red-900';
                  } else {
                    buttonClass = 'border-2 border-gray-200 bg-gray-50 text-gray-500';
                  }
                } else if (selectedAnswer === i) {
                  buttonClass = 'border-2 border-amber-500 bg-amber-100';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !showResult && handleAnswer(i)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl transition-all ${buttonClass}`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold mr-3">
                      {letter}
                    </span>
                    {option}
                    {showResult && i === currentQuestion.correct && (
                      <span className="float-right text-green-600">✓</span>
                    )}
                    {showResult && i === selectedAnswer && i !== currentQuestion.correct && (
                      <span className="float-right text-red-600">✗</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-amber-100"
              >
                <div className={`p-6 ${selectedAnswer === currentQuestion.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`font-semibold mb-2 ${selectedAnswer === currentQuestion.correct ? 'text-green-800' : 'text-red-800'}`}>
                    {selectedAnswer === currentQuestion.correct ? '🎉 Correct!' : '❌ Not quite!'}
                  </p>
                  <p className="text-gray-700">{currentQuestion.explanation}</p>
                </div>
                <div className="p-4 bg-white">
                  <button
                    onClick={nextQuestion}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    {currentIndex >= questions.length - 1 ? 'See Results' : 'Next Question'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Paused</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl">🍞</div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
