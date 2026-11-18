
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

const cors = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

const respond = (statusCode, body) => ({
  statusCode,
  headers: cors,
  body: JSON.stringify(body)
});

async function db(path, opts = {}) {
  if (!url || !key) {
    throw new Error('Supabase is not configured');
  }

  const r = await fetch(
    url.replace(/\/$/, '') + '/rest/v1/' + path,
    {
      ...opts,
      headers: {
        apikey: key,
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    }
  );

  if (!r.ok) {
    throw new Error('Database error: ' + r.status);
  }

  return r.status === 204 ? null : r.json();
}

module.exports = { db, respond };
