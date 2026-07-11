const loopbackHosts = new Set(['127.0.0.1', 'localhost', '::1']);

export const resolveLoopbackHost = (host = process.env.HOST ?? '127.0.0.1'): string => {
  if (!loopbackHosts.has(host)) {
    throw new Error(`HOST must stay on loopback for this server. Received "${host}".`);
  }

  return host;
};
