import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  format, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  subYears,
  getYear
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import '../Schedule.css';

interface ReviewCalendarProps {
  appData: any;
}

const CELL_SIZE = 15;
const CELL_GAP = 3;
const DAY_LABEL_WIDTH = 24;

const ReviewCalendar: React.FC<ReviewCalendarProps> = ({ appData }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoveredDate, setHoveredDate] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reviewCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    Object.values(appData).forEach((items: any) => {
      items.forEach((item: any) => {
        item.reviews.forEach((dateStr: string | null, idx: number) => {
          if (dateStr) {
            counts[dateStr] = (counts[dateStr] || 0) + 1;
          }
        });
      });
    });
    
    return counts;
  }, [appData]);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-[#161b22]';
    if (count === 1) return 'bg-[#0e4429]';
    if (count === 2) return 'bg-[#006d32]';
    if (count <= 4) return 'bg-[#26a641]';
    return 'bg-[#39d353]';
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '三', '五'];

  const calendarData = useMemo(() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 0, 1));
    const start = startOfWeek(yearStart);
    const end = endOfWeek(yearEnd);
    const days = eachDayOfInterval({ start, end });

    const weeks: { date: Date; count: number; dateStr: string }[][] = [];
    let currentWeek: { date: Date; count: number; dateStr: string }[] = [];

    days.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      currentWeek.push({
        date: day,
        count: reviewCounts[dateStr] || 0,
        dateStr
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Calculate month positions
    const monthPositions: { month: number; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIdx) => {
      const firstDayOfWeek = week[0];
      const month = firstDayOfWeek.date.getMonth();
      if (month !== lastMonth) {
        monthPositions.push({ month, weekIndex: weekIdx });
        lastMonth = month;
      }
    });

    return { weeks, monthPositions };
  }, [currentYear, reviewCounts]);

  const totalReviews = Object.values(reviewCounts).reduce((sum, count) => sum + count, 0);
  const activeDays = Object.keys(reviewCounts).length;

  const handleMouseEnter = (e: React.MouseEvent, day: { dateStr: string; count: number }) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setHoveredDate({
        date: day.dateStr,
        count: day.count,
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  return (
    <div className="luxury-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#d4af37]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4.03 7.75l-4 4a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06l1.72 1.72 3.72-3.72a.75.75 0 011.06 1.06z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#e8e8e8] font-serif">学习热力图</h3>
            <p className="text-xs text-[#555]">记录您的学习历程</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-[#d4af37]">{totalReviews}</div>
            <div className="text-xs text-[#555]">总复习</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#d4af37]">{activeDays}</div>
            <div className="text-xs text-[#555]">活跃天数</div>
          </div>
          <button 
            onClick={() => setCurrentYear(new Date().getFullYear())}
            className="px-3 py-1.5 border border-[#d4af37]/30 rounded text-xs text-[#d4af37]/70 hover:text-[#d4af37] hover:border-[#d4af37] transition-colors"
          >
            今年
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2" ref={containerRef}>
        <div className="relative">
          {/* Month Labels Row - positioned relative to grid */}
          <div className="flex ml-8 mb-2 relative" style={{ height: '16px' }}>
            {calendarData.monthPositions.map(({ month, weekIndex }) => {
              const left = weekIndex * (CELL_SIZE + CELL_GAP);
              return (
                <div
                  key={`month-${month}`}
                  className="absolute text-[11px] text-[#555] whitespace-nowrap"
                  style={{ left: `${left}px` }}
                >
                  {monthNames[month]}
                </div>
              );
            })}
          </div>

          {/* Calendar with Day Labels */}
          <div className="flex">
            {/* Day Labels Column */}
            <div className="flex flex-col mr-2">
              {weekDays.map((day, idx) => (
                <div
                  key={`day-${idx}`}
                  className="text-[10px] text-[#555] flex items-center"
                  style={{ height: CELL_SIZE + CELL_GAP }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex gap-[3px]">
              {calendarData.weeks.map((week, weekIdx) => (
                <div key={`week-${weekIdx}`} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => {
                    const isCurrentYear = day.date.getFullYear() === currentYear;
                    
                    return (
                      <div
                        key={day.dateStr}
                        className={`
                          rounded-sm transition-all cursor-pointer
                          ${getIntensity(day.count)}
                          ${isCurrentYear ? 'opacity-100' : 'opacity-30'}
                          hover:ring-2 hover:ring-[#d4af37]/50 hover:scale-110
                        `}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={() => setHoveredDate(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div 
          className="fixed z-50 pointer-events-none bg-[#1a1a1a] border border-[#30363d] rounded-lg px-3 py-2 shadow-xl"
          style={{ 
            left: `${hoveredDate.x + 10}px`, 
            top: `${hoveredDate.y + 10}px` 
          }}
        >
          <div className="text-sm font-bold text-[#e8e8e8]">
            {format(new Date(hoveredDate.date), 'yyyy年M月d日', { locale: zhCN })}
          </div>
          <div className="text-xs text-[#d4af37]">
            {hoveredDate.count} 个复习任务
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-6 text-xs text-[#555]">
        <span>少</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#161b22]" />
          <div className="w-3 h-3 rounded-sm bg-[#0e4429]" />
          <div className="w-3 h-3 rounded-sm bg-[#006d32]" />
          <div className="w-3 h-3 rounded-sm bg-[#26a641]" />
          <div className="w-3 h-3 rounded-sm bg-[#39d353]" />
        </div>
        <span>多</span>
      </div>
    </div>
  );
};

export default ReviewCalendar;
