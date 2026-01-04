'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Trophy, Clock, BookOpen } from 'lucide-react';
import { getPlayerStats, getSoundEnabled, setSoundEnabled } from '@/lib/storage';
import { PlayerStats, Tier } from '@/types';

const tiers: { name: Tier; time: number; description: string }[] = [
  { name: 'Fresh from the Oven', time: 30, description: 'Perfect for beginners' },
  { name: 'Crusty Veteran', time: 20, description: 'For experienced bakers' },
  { name: 'Master Baker', time: 15, description: 'Expert level challenges' },
];

export default function Home() {
  const [soundEnabled, setSoundState] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    setSoundState(getSoundEnabled());
    setStats(getPlayerStats());
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundState(newState);
    setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍞</span>
            <div>
              <h1 className="text-xl font-bold text-amber-900">The Great Bread Showdown</h1>
              <p className="text-sm text-amber-700">Test Your Baking Knowledge!</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg hover:bg-amber-100 transition-colors"
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-amber-600" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Classic Challenge */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Classic Challenge</h2>
                  <p className="text-amber-100 text-sm">Timed questions, prove your skills</p>
                </div>
              </div>
            </div>
            <div className="p-6 grid gap-3">
              {tiers.map((tier) => (
                <Link
                  key={tier.name}
                  href={`/play?mode=classic&tier=${encodeURIComponent(tier.name)}`}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                >
                  <div>
                    <h3 className="font-semibold text-amber-900 group-hover:text-amber-700">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-amber-600 font-medium">{tier.time}s per question</span>
                    {stats && stats.highScores[tier.name] > 0 && (
                      <p className="text-xs text-gray-500">Best: {stats.highScores[tier.name]} pts</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Practice Mode */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Practice Mode</h2>
                  <p className="text-green-100 text-sm">Learn at your own pace, no timer</p>
                </div>
              </div>
            </div>
            <div className="p-6 grid gap-3">
              {tiers.map((tier) => (
                <Link
                  key={tier.name}
                  href={`/play?mode=practice&tier=${encodeURIComponent(tier.name)}`}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all group"
                >
                  <div>
                    <h3 className="font-semibold text-green-900 group-hover:text-green-700">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">No time limit</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        {stats && stats.totalGames > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-purple-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Your Stats</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalGames}</p>
                  <p className="text-sm text-gray-600">Games Played</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.badges.length}</p>
                  <p className="text-sm text-gray-600">Badges</p>
                </div>
              </div>
              {stats.badges.length > 0 && (
                <div className="px-6 pb-6">
                  <div className="flex flex-wrap gap-2">
                    {stats.badges.map((badge) => (
                      <span key={badge} className="text-2xl" title={badge}>
                        {badge === 'first_loaf' && '🍞'}
                        {badge === 'perfectionist' && '💯'}
                        {badge === 'streak_master' && '🔥'}
                        {badge === 'star_baker' && '🏆'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-8">
          <p className="mb-2">Part of <strong>Crust & Crumb Academy</strong></p>
          <p>by Baking Great Bread at Home</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="https://www.skool.com/crust-crumb-academy-7621" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              Skool Community
            </a>
            <a href="https://www.facebook.com/groups/1082865755403754" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              Facebook Group
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
