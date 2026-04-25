import React, { useMemo } from 'react';
import { Trophy, Flame, Target, TrendingUp } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import '../Schedule.css';

interface StatsOverviewProps {
  appData: any;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ appData }) => {
  const stats = useMemo(() => {
    let totalUnits = 0;
    let startedUnits = 0;
    let completedReviews = 0;
    let totalReviews = 0;
    const activeDays = new Set<string>();

    Object.values(appData).forEach((items: any) => {
      items.forEach((item: any) => {
        totalUnits++;
        if (item.startDate) {
          startedUnits++;
          activeDays.add(item.startDate);
        }
        
        // Count reviews
        item.reviews.forEach((rDate: string, idx: number) => {
            if (rDate) {
                totalReviews++;
                if (item.status[`r${idx+1}`]) {
                    completedReviews++;
                    // Ideally we track completion date, but here we approximate activity
                    // If a review is marked done, we assume activity happened
                }
            }
        });
      });
    });

    // Calculate Streak (Simplified approximation based on start dates for now)
    // Real streak calculation needs a separate "activity log", but we can approximate
    // by checking recent start dates or we'd need to change data structure.
    // For now, let's just show "Started Units" as a proxy for engagement.
    
    return {
      totalUnits,
      startedUnits,
      progress: totalUnits > 0 ? Math.round((startedUnits / totalUnits) * 100) : 0,
      reviewRate: totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0,
      activeDayCount: activeDays.size
    };
  }, [appData]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="luxury-card p-5 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center gap-2 text-[#d4af37] mb-3 relative z-10">
          <Target className="w-6 h-6" />
          <span className="text-xs font-serif tracking-widest uppercase">总单元</span>
        </div>
        <span className="text-3xl font-bold text-[#e8e8e8] relative z-10">{stats.totalUnits}</span>
      </div>

      <div className="luxury-card p-5 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center gap-2 text-[#d4af37] mb-3 relative z-10">
          <Flame className="w-6 h-6" />
          <span className="text-xs font-serif tracking-widest uppercase">进行中</span>
        </div>
        <span className="text-3xl font-bold text-[#e8e8e8] relative z-10">{stats.startedUnits}</span>
      </div>

      <div className="luxury-card p-5 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center gap-2 text-[#d4af37] mb-3 relative z-10">
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs font-serif tracking-widest uppercase">覆盖率</span>
        </div>
        <span className="text-3xl font-bold text-[#d4af37] relative z-10">{stats.progress}%</span>
      </div>

      <div className="luxury-card p-5 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center gap-2 text-[#d4af37] mb-3 relative z-10">
          <Trophy className="w-6 h-6" />
          <span className="text-xs font-serif tracking-widest uppercase">复习率</span>
        </div>
        <span className="text-3xl font-bold text-[#d4af37] relative z-10">{stats.reviewRate}%</span>
      </div>
    </div>
  );
};

export default StatsOverview;
