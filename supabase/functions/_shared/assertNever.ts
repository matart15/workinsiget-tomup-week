export const assertNever = (x: never): never => {
  throw new Error(`${x} is unexpected value. Should have been never.`);
};
