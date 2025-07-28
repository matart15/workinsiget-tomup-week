import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetUserActivityLogs } from '@/hooks/db/user-activity-logs/queries/useGetUserActivityLogs';

type UserActivityLogsProps = {
  profileId: string;
  limit?: number;
  showTitle?: boolean;
};

const formatDuration = (duration: number): string => {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

const getDomainFromUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
};

export const UserActivityLogs: React.FC<UserActivityLogsProps> = ({
  profileId,
  limit = 50,
  showTitle = true,
}) => {
  const { data: logs, isLoading, error } = useGetUserActivityLogs({
    profileId,
    limit,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array.from({ length: 5 })].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            Error loading activity logs:
            {' '}
            {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-gray-500 text-center">
            No activity logs found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="divide-y">
          {logs.map(log => (
            <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {log.title || getDomainFromUrl(log.url)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(log.duration)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {log.url}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
