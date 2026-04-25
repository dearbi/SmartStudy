import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { FeedListProps } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const FeedList: React.FC<FeedListProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-black-light p-4 rounded-lg shadow-sm border border-gray-800 hover:shadow-md transition-shadow hover:border-gold-500/30 group">
          <div className="flex items-start justify-between">
            <div className="w-full">
                <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.category === '高考' ? 'bg-orange-900/20 text-orange-400' :
                        item.category === '考研' ? 'bg-blue-900/20 text-blue-400' :
                        item.category === '考公' ? 'bg-red-900/20 text-red-400' :
                        'bg-green-900/20 text-green-400'
                    }`}>
                        {item.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {(() => {
                            try {
                                return formatDistanceToNow(new Date(item.publishTime), { addSuffix: true, locale: zhCN });
                            } catch (e) {
                                return '未知时间';
                            }
                        })()}
                    </span>
                </div>
                {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group-hover:text-gold-400 transition-colors">
                        <h4 className="text-lg font-bold text-gray-200 mb-1 flex items-center gap-2">
                            {item.title}
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
                        </h4>
                    </a>
                ) : (
                    <h4 className="text-lg font-bold text-gray-200 mb-1 hover:text-gold-400 cursor-pointer transition-colors">{item.title}</h4>
                )}
                <p className="text-sm text-gray-400 line-clamp-2">{item.summary}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
            <span>来源: {item.source}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedList;
