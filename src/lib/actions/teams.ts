export const createTeam = async (formData: FormData) => {
  const name = formData.get('name');
  const slug = formData.get('slug');

  console.log('🚀 ~ createTeam ~ name:', name);
  console.log('🚀 ~ createTeam ~ slug:', slug);
};

export const editTeamName = async (formData: FormData) => {
  const name = formData.get('name');
  const accountId = formData.get('accountId');

  console.log('🚀 ~ editTeamName ~ name:', name);
  console.log('🚀 ~ editTeamName ~ accountId:', accountId);
};
