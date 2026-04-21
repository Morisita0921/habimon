import { useState } from 'react';
import { Home, CalendarDays, Award, Coins, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ViewType } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useUserData } from './hooks/useUserData';
import LoginView from './views/LoginView';
import UserHome from './views/UserHome';
import CalendarView from './views/CalendarView';
import AchievementView from './views/AchievementView';
import ShopView from './views/ShopView';
import AdminDashboard from './views/AdminDashboard';

// ===== ログアウト確認モーダル =====
function LogoutConfirm({ show, onClose, onConfirm }: {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
          >
            <h2 className="font-heading font-bold text-lg text-navy mb-2">ログアウトしますか？</h2>
            <p className="text-sm text-gray-500 mb-5">ログアウトするとログイン画面に戻ります。</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-heading text-gray-600 min-h-12 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-heading font-bold min-h-12 hover:bg-red-600"
              >
                ログアウト
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== 認証済みメイン画面 =====
function MainApp() {
  const { profile, signOut } = useAuth();
  const { userData, loading, updateUser } = useUserData();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ローディング
  if (loading || !userData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #E8F8FF 100%)' }}
      >
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">🐾</div>
          <p className="text-white/80 font-heading">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 管理者ビュー
  if (profile?.is_admin && currentView === 'admin') {
    return (
      <div>
        <AdminDashboard />
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setCurrentView('home')}
            className="px-4 py-2 bg-navy text-white rounded-full text-sm shadow-lg hover:bg-navy-light transition-colors min-h-12"
          >
            利用者画面へ
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-full text-sm shadow-lg hover:bg-red-600 transition-colors min-h-12"
          >
            ログアウト
          </button>
        </div>
        <LogoutConfirm
          show={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={signOut}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col">
      {/* ヘッダー（ホーム以外） */}
      {currentView !== 'home' && (
        <header className="bg-white/80 backdrop-blur-sm border-b border-main-light/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <h1 className="font-heading font-bold text-lg text-main-dark">🐾 ハビもん</h1>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 min-h-8"
          >
            <LogOut size={14} />
            ログアウト
          </button>
        </header>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1">
        {currentView === 'home' && (
          <UserHome
            user={userData}
            onUpdateUser={(u) => updateUser(u)}
            onReset={() => {}}
          />
        )}
        {currentView === 'calendar' && <CalendarView user={userData} />}
        {currentView === 'achievement' && <AchievementView user={userData} />}
        {currentView === 'shop' && (
          <ShopView user={userData} onUpdateUser={(u) => updateUser(u)} />
        )}
      </main>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-40">
        <div className="max-w-lg mx-auto flex">
          {([
            { view: 'home' as ViewType, icon: Home, label: 'ホーム' },
            { view: 'calendar' as ViewType, icon: CalendarDays, label: 'カレンダー' },
            { view: 'achievement' as ViewType, icon: Award, label: 'じっせき' },
            { view: 'shop' as ViewType, icon: Coins, label: 'ショップ' },
          ] as const).map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 min-h-14 transition-colors ${
                currentView === view
                  ? view === 'shop' ? 'text-amber-600' : 'text-main'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={label}
            >
              <Icon size={22} />
              <span className="text-xs mt-1 font-heading">{label}</span>
            </button>
          ))}
          {/* 管理者ボタン（管理者のみ表示） */}
          {profile?.is_admin && (
            <button
              onClick={() => setCurrentView('admin')}
              className="flex-1 flex flex-col items-center py-2 pt-3 min-h-14 text-gray-400 hover:text-navy transition-colors"
              aria-label="管理者"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-xs mt-1 font-heading">かんり</span>
            </button>
          )}
        </div>
      </nav>

      <LogoutConfirm
        show={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={signOut}
      />
    </div>
  );
}

// ===== ルートコンポーネント（認証分岐） =====
function AppRouter() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #E8F8FF 100%)' }}
      >
        <div className="text-5xl animate-bounce">🐾</div>
      </div>
    );
  }

  if (!session) return <LoginView />;
  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
