import React from 'react';

import { useParams } from '@/router';

import { StaffMatchDetailContainer } from './_components/container/StaffMatchDetailContainer';

const StaffMatchDetailPage = () => {
  const { id: idString } = useParams('/staff/match/:id');
  const id = Number(idString);

  if (Number.isNaN(id)) {
    return <div>Invalid match ID</div>;
  }

  return <StaffMatchDetailContainer matchId={id} />;
};

export default StaffMatchDetailPage;
