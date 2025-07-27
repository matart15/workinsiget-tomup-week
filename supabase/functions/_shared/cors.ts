export const corsResponse = (response: Response) => {
  response.headers.append("Access-Control-Allow-Origin", "*");
  response.headers.append("Access-Control-Allow-Headers", "*");
  return response;
};
