// netlify/functions/tap-new.js
import { createClient } from '@supabase/supabase-js';

const cors = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

const json = (body, status = 200) => ({
  statusCode: status,
  headers: { ...cors(), 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors() };
  if (event.httpMethod !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (event.headers['x-admin-secret'] !== adminSecret) return json({ error: 'Unauthorized' }, 401);

    const { name, brewery, style, abv, keg_size_oz, pours_remaining, cost_per_keg } = JSON.parse(event.body || '{}');
    if (!name || !brewery) return json({ error: 'Missing name or brewery' }, 400);

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('taps').insert([
      {
        name,
        brewery,
        style,
        abv,
        keg_size_oz,
        pours_remaining,
        cost_per_keg,
        is_on_tap: true,
        tapped_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return json({ success: true, inserted: data });
  } catch (err) {
    console.error(err);
    return json({ error: err.message || 'Insert failed' }, 500);
  }
};
