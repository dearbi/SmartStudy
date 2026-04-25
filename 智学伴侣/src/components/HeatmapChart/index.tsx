import React, { useState } from 'react';
import { HeatmapChartProps } from '../../types';
import { format, subDays, getDay, getMonth, startOfMonth, isSameMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'week'>('year');
  
  // Helper to get color based on count - GitHub style green gradient
  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#161b22]'; // GitHub style dark gray (no activity)
    if (count <= 3) return 'bg-[#0e4429]'; // GitHub style low activity
    if (count <= 6) return 'bg-[#006d32]'; // GitHub style medium activity
    if (count <= 9) return 'bg-[#26a641]'; // GitHub style high activity
    return 'bg-[#39d353]'; // GitHub style very high activity
  };

  // Process data into a map for easy lookup
  const dataMap = new Map(data.map(d => [d.date, d.count]));

  // Generate days to display
  const today = new Date();
  let totalDays = 365;
  if (viewMode === 'month') totalDays = 30;
  if (viewMode === 'week') totalDays = 7;
  
  // Generate array of dates
  const dates = Array.from({ length: totalDays }, (_, i) => {
    const date = subDays(today, totalDays - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date,
      dateStr,
      count: dataMap.get(dateStr) || 0
    };
  });

  // Group by weeks for the grid layout (columns are weeks)
  const weeks: (typeof dates[0] | null)[][] = [];
  let currentWeek: (typeof dates[0] | null)[] = [];
  
  // Fill first week with empty days if start date is not Sunday
  // Note: getDay() returns 0 for Sunday
  const startDay = getDay(dates[0].date);
  for (let i = 0; i < startDay; i++) {
     currentWeek.push(null);
  }

  dates.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  // Push remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
        currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Determine box size based on view mode - GitHub style sizes
  const getBoxSize = () => {
    if (viewMode === 'week') return 'w-10 h-10 rounded-sm';
    if (viewMode === 'month') return 'w-6 h-6 rounded-sm';
    return 'w-3 h-3 rounded-sm'; // GitHub style small boxes for year view
  };

  const boxSize = getBoxSize();



  // Weekday labels - GitHub style (abbreviated)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Shorter labels for GitHub style

  // Generate month labels for year view - GitHub style
  const generateYearMonthLabels = () => {
    if (viewMode !== 'year') return [];
    
    const labels = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    
    // 从一年前开始计算
    const startDate = subDays(today, 364); // 365 days including today
    let currentMonth = startDate.getMonth();
    
    // 遍历每一周，检查是否需要添加月份标签
    weeks.forEach((week, weekIndex) => {
      if (week.length > 0 && week[0]) {
        const weekDate = week[0].date;
        const weekMonth = weekDate.getMonth();
        
        // 如果月份发生变化或者是第一个月
        if (weekMonth !== currentMonth || weekIndex === 0) {
          // 检查是否是该月的第一天或者接近第一天
          const dayOfMonth = weekDate.getDate();
          if (dayOfMonth <= 7 || weekIndex === 0) {
            labels.push({
              weekIndex,
              month: months[weekMonth]
            });
            currentMonth = weekMonth;
          }
        }
      }
    });
    
    return labels;
  };

  // Generate date labels for month view
  const generateMonthDateLabels = () => {
    if (viewMode !== 'month') return [];
    
    const labels = [];
    let currentDate = 0;
    
    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        if (day) {
          const date = parseInt(format(day.date, 'd'));
          if (date !== currentDate && (date === 1 || date % 5 === 0)) {
            currentDate = date;
            labels.push({
              weekIndex,
              dayIndex,
              date: date.toString()
            });
          }
        }
      });
    });
    return labels;
  };

  // Generate weekday labels for week view
  const generateWeekdayLabels = () => {
    if (viewMode !== 'week') return [];
    
    const labels = [];
    const today = new Date();
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      labels.push({
        day: weekdays[getDay(date)].substring(0, 1), // 只显示星期的第一个字母，更接近 GitHub 风格
        date: format(date, 'd')
      });
    }
    return labels;
  };

  const yearMonthLabels = generateYearMonthLabels();
  const monthDateLabels = generateMonthDateLabels();
  const weekDayLabels = generateWeekdayLabels();
  
  // Remove debug logs for production
  // console.log('Year month labels:', yearMonthLabels);
  // console.log('Month date labels:', monthDateLabels);
  // console.log('Week day labels:', weekDayLabels);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
         <h3 className="font-medium text-gray-400 text-sm">
            {viewMode === 'year' ? '过去一年活跃度' : viewMode === 'month' ? '过去一月活跃度' : '过去一周活跃度'}
         </h3>
         <div className="flex space-x-2 text-xs">
            <button
                onClick={() => setViewMode('year')}
                className={`px-3 py-1 rounded transition-colors border ${viewMode === 'year' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
            >
                最近一年
            </button>
            <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded transition-colors border ${viewMode === 'month' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
            >
                最近一月
            </button>
            <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded transition-colors border ${viewMode === 'week' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
            >
                最近一周
            </button>
         </div>
      </div>
      
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex items-start gap-2 min-w-max">
            {/* Weekday labels for year, month, and week views - GitHub style */}
            {(viewMode === 'year' || viewMode === 'month' || viewMode === 'week') && (
                <div className="flex flex-col gap-1 pr-3">
                    {viewMode === 'year' || viewMode === 'month' ? weekdays.map((day, index) => (
                        <div key={index} className="text-xs text-gray-500 font-medium flex items-center" style={{ height: viewMode === 'month' ? '25px' : '12px', lineHeight: viewMode === 'month' ? '25px' : '12px' }}>
                            <span className="text-right w-4">{weekdayShort[index]}</span>
                        </div>
                    )) : weekDayLabels.map((label, index) => (
                        <div key={index} className="text-xs text-gray-500 h-10 flex flex-col items-center justify-center">
                            <div>{label.day}</div>
                            <div>{label.date}</div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Heatmap grid with labels */}
            <div className="relative">
                {/* Month labels for year view - GitHub style */}
                {viewMode === 'year' && yearMonthLabels.length > 0 && (
                    <div className="absolute top-[-20px] left-0 right-0 flex z-10">
                        {yearMonthLabels.map((month, index) => (
                            <div
                                key={index}
                                className="text-xs text-gray-500 font-medium"
                                style={{
                                    marginLeft: `${month.weekIndex * 13}px`, // Adjusted for GitHub style spacing
                                    width: '30px',
                                    textAlign: 'center'
                                }}
                            >
                                {month.month}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Date labels for month view - GitHub style */}
                {viewMode === 'month' && monthDateLabels.length > 0 && (
                    <div className="absolute top-[-20px] left-0 right-0 flex z-10">
                        {monthDateLabels.map((label, index) => (
                            <div
                                key={index}
                                className="text-xs text-gray-500 font-medium"
                                style={{
                                    marginLeft: `${label.weekIndex * 25}px`,
                                    width: '20px',
                                    textAlign: 'center'
                                }}
                            >
                                {label.date}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Heatmap grid - GitHub style */}
                <div className={`flex gap-1 ${viewMode === 'year' || viewMode === 'month' ? 'pt-4' : ''}`}>
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {week.map((day, dIndex) => (
                                <div
                                    key={dIndex}
                                    className={`${boxSize} transition-all hover:ring-1 hover:ring-gray-300/50 ${day ? getColor(day.count) : 'bg-transparent'}`}
                                    title={day ? `${day.dateStr}: ${day.count} 活跃度` : ''}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-end items-center mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
         <span>Less</span>
         <div className="w-3 h-3 bg-[#161b22] rounded-sm"></div>
         <div className="w-3 h-3 bg-[#0e4429] rounded-sm"></div>
         <div className="w-3 h-3 bg-[#006d32] rounded-sm"></div>
         <div className="w-3 h-3 bg-[#26a641] rounded-sm"></div>
         <div className="w-3 h-3 bg-[#39d353] rounded-sm"></div>
         <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
