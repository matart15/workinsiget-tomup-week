import { useAuth } from '@matart15/lib_authentication_supabase';
import React, { useState } from 'react';

import { DatePicker } from '@/components/extra/DatePicker';
import { UserActivityLogs } from '@/components/extra/UserActivityLogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminActivityLogsPage() {
  const { user } = useAuth();
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Activity Logs</h1>
          <p>Please log in to view activity logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Admin Activity Logs</h1>
        <p className="text-gray-600">
          View and analyze user activity logs from the Chrome extension.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profileId">Profile ID</Label>
              <Input
                id="profileId"
                value={selectedProfileId}
                onChange={e => setSelectedProfileId(e.target.value)}
                placeholder="Enter profile ID"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                />
              </div>

              <div>
                <Label>End Date</Label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
                variant="outline"
              >
                Clear Dates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs */}
        {selectedProfileId && (
          <UserActivityLogs
            profileId={selectedProfileId}
            limit={100}
            showTitle={false}
          />
        )}
      </div>
    </div>
  );
}
