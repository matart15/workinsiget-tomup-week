export const updateTeamMemberRole = async (formData: FormData) => {
  const accountId = formData.get('accountId');
  const userId = formData.get('userId');
  const teamRole = formData.get('teamRole');

  console.log('🚀 ~ updateTeamMemberRole ~ accountId:', accountId);
  console.log('🚀 ~ updateTeamMemberRole ~ userId:', userId);
  console.log('🚀 ~ updateTeamMemberRole ~ teamRole:', teamRole);
};

export const removeTeamMember = async (formData: FormData) => {
  const accountId = formData.get('accountId');
  const userId = formData.get('userId');

  console.log('🚀 ~ removeTeamMember ~ accountId:', accountId);
  console.log('🚀 ~ removeTeamMember ~ userId:', userId);
};
