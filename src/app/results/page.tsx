'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Share2, Trophy } from 'lucide-react';
import { getScoreBadge } from '@/lib/scoring';
import { QUESTIONS_PER_GAME, BASE_POINTS, SCORE_MULTIPLIERS } from '@/types';

function ResultsContent() {
  const searchParams = useSearchParams();

  let data = {
    mode: 'classic',
    tier: 'Fresh from the Oven',
    score: 0,
    correct: 0,
    total: QUESTIONS_PER_GAME,
    bestStreak: 0,
  };

  try {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      data = JSON.parse(decodeURIComponent(dataParam));
    }
  } catch (e) {
    console.error('Error parsing results data');
  }

  const maxScore = data.total * BASE_POINTS * SCORE_MULTIPLIERS.FAST;
  const badge = getScoreBadge(data.score, maxScore);
  const accuracy = Math.round((data.correct / data.total) * 100);
  const isPerfect = data.correct === data.total;

  const handleShare = async () => {
    const text = `🍞 I scored ${data.score} points on ${data.tier} in The Great Bread Showdown! ${accuracy}% accuracy. Can you beat my score?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Great Bread Showdown',
          text,
          url: window.location.origin,
        });
      } catch (e) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.origin);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        {/* Hero */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-8xl mb-4"
          >
            {badge.icon}
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-amber-900 mb-2"
          >
            {badge.title}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            {data.mode === 'practice' ? 'Practice' : 'Classic'} • {data.tier}
          </motion.p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center text-white">
            <p className="text-amber-100 text-sm mb-1">Total Score</p>
            <p className="text-5xl font-bold">{data.score.toLocaleString()}</p>
            <p className="text-amber-200 text-sm mt-1">out of {maxScore.toLocaleString()} possible</p>
          </div>

          <div className="p-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-green-600">{data.correct}/{data.total}</p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">{accuracy}%</p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">{data.bestStreak}</p>
              <p className="text-sm text-gray-600">Best Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Perfect Score Celebration */}
        {isPerfect && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-6 mb-6 text-center border-2 border-yellow-400"
          >
            <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-yellow-800">Perfect Score!</h2>
            <p className="text-yellow-700">You got every question right!</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid gap-3"
        >
          <button
            onClick={handleShare}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Results
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/play?mode=${data.mode}&tier=${encodeURIComponent(data.tier)}`}
              className="py-4 bg-white border-2 border-amber-200 hover:border-amber-400 text-amber-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </Link>
            <Link
              href="/"
              className="py-4 bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-8 mt-8">
          <p className="mb-2">Part of <strong>Crust & Crumb Academy</strong></p>
          <p>by Baking Great Bread at Home</p>
        </footer>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl">🍞</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
