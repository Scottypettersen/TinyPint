// netlify/functions/adjust.js
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

    const { id, change } = JSON.parse(event.body || '{}');
    if (!id || typeof change !== 'number') return json({ error: 'Missing id or change number' }, 400);

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the current value
    const { data: row, error: fetchError } = await supabase.from('taps').select('pours_remaining').eq('id', id).single();
    if (fetchError) throw fetchError;
    if (!row) return json({ error: 'Tap not found' }, 404);

    const newVal = Math.max(0, (row.pours_remaining || 0) + change);

    const { error: updateError } = await supabase
      .from('taps')
      .update({ pours_remaining: newVal, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;
    return json({ success: true, new_pours_remaining: newVal });
  } catch (err) {
    console.error(err);
    return json({ error: err.message || 'Adjust failed' }, 500);
  }
};
