const {createHash, timingSafeEqual} = require('node:crypto');

module.exports = function unlock(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).end();
  if (!(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).end();
  const password = req.body && req.body.password;
  if (typeof password !== 'string' || password.length > 256) return res.status(400).end();
  const secret = process.env.FLOW2_PREP_ACCESS;
  if (!secret) return res.status(503).end();
  const [digest, key] = secret.trim().split(':');
  if (!/^[a-f0-9]{64}$/.test(digest) || !/^[a-f0-9]{64}$/.test(key)) return res.status(503).end();
  const actual = createHash('sha256').update(password).digest();
  if (!timingSafeEqual(actual, Buffer.from(digest, 'hex'))) return res.status(401).end();
  return res.status(200).json({key});
};
