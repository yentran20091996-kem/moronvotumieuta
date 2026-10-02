import React from 'react';
import { PenTool, Compass, Mic, BookMarked, Gamepad2 } from 'lucide-react';

export type TabKey = 'studio' | 'planetMap' | 'speechRefine' | 'arcade' | 'journal';

interface NavigationTabsProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      key: 'studio' as TabKey,
      label: 'Xưởng Chế Tác Câu Chữ',
      sublabel: 'Show, Don\'t Tell & Ngũ Giác',
      icon: PenTool,
      accentColor: 'from-pink-500 to-rose-400',
      activeBg: 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm',
      inactiveHover: 'hover:bg-rose-50/50 text-slate-600',
    },
    {
      key: 'planetMap' as TabKey,
      label: 'Bản Đồ Từ Vựng',
      sublabel: '4 Hành Tinh & Quỹ Đạo Từ',
      icon: Compass,
      accentColor: 'from-emerald-500 to-teal-400',
      activeBg: 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm',
      inactiveHover: 'hover:bg-emerald-50/50 text-slate-600',
    },
    {
      key: 'speechRefine' as TabKey,
      label: 'Phép Thuật Ngôn Từ',
      sublabel: 'Lọc Giọng Nói & Tinh Chỉnh',
      icon: Mic,
      accentColor: 'from-purple-500 to-indigo-400',
      activeBg: 'bg-purple-50 border-purple-300 text-purple-800 shadow-sm',
      inactiveHover: 'hover:bg-purple-50/50 text-slate-600',
    },
    {
      key: 'arcade' as TabKey,
      label: 'Đấu Trường Tinh Tú',
      sublabel: 'Minigames Ôn Tập Vui',
      icon: Gamepad2,
      accentColor: 'from-violet-500 to-fuchsia-400',
      activeBg: 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-900 shadow-sm',
      inactiveHover: 'hover:bg-fuchsia-50/50 text-slate-600',
    },
    {
      key: 'journal' as TabKey,
      label: 'Hành Trình & Sổ Tay',
      sublabel: 'Thử Thách & Kho Báu',
      icon: BookMarked,
      accentColor: 'from-amber-500 to-yellow-400',
      activeBg: 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm',
      inactiveHover: 'hover:bg-amber-50/50 text-slate-600',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left group ${
                isActive
                  ? tab.activeBg
                  : `border-transparent ${tab.inactiveHover}`
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${tab.accentColor} text-white shadow-xs transition-transform group-hover:scale-105`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold truncate">
                  {tab.label}
                </p>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  {tab.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
