import { patterns } from '@generouted/react-router/core';

export const pathToUrl = (filePath: string) => {
  const file = filePath.match(/(src\/pages\/.+\.tsx)/)?.[1];
  const url = `/${file}`
    ?.replace(...patterns.route)
    .split('/')
    .map(
      segment =>
        (segment === 'index' || /^\([\w-]+\)$/.test(segment) ? '' : '/')
        + segment
          .replace(/^\([\w-]+\)$/g, '')
          .replace(...patterns.splat)
          .replace(...patterns.param)
          .replace(...patterns.slash)
          .replace(...patterns.optional),
    )
    .join('');
  return url;
};
