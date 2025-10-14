// netlify/functions/pour.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  try {
    // CORS / method guard
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors() };
    if (event.httpMethod !== 'POST') return json({ error: 'Method not allowed' }, 405);

    // admin secret check
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) return json({ error: 'Server missing ADMIN_SECRET' }, 500);

    // normalize headers (Node lowercases headers, but normalize anyway)
    const h = Object.fromEntries(Object.entries(event.headers || {}).map(([k,v]) => [k.toLowerCase(), v]));
    if (h['x-admin-secret'] !== adminSecret) return json({ error: 'Unauthorized' }, 401);

    // env for Supabase
    const url = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRole) return json({ error: 'Server missing Supabase env' }, 500);

    // parse body safely
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }
    const { tapId, sizeOz, price, source, note } = body;
    if (!tapId || !sizeOz) return json({ error: 'tapId and sizeOz required' }, 400);

    // optional breadcrumbs (safe: don’t log secrets)
    console.log('[pour] tapId=%s sizeOz=%s source=%s', tapId, sizeOz, source || 'manual');

    const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

    // OPTIONAL: fast sanity check if you keep seeing "Invalid API key"
    // const ping = await supabase.from('taps').select('id', { count: 'exact', head: true }).limit(1);
    // if (ping.error) return json({ error: 'Supabase ping failed: ' + ping.error.message }, 500);

    // call RPC
    const { data, error } = await supabase.rpc('log_pour_and_decrement', {
      p_tap_id: tapId,
      p_size_oz: sizeOz,
      p_price: price ?? 0,
      p_source: source ?? 'manual',
      p_note: note ?? null,
    });

    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, result: data });
  } catch (e) {
    console.error('[pour] Uncaught', e);
    return json({ error: e.message || String(e) }, 500);
  }
};

// helpers
function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
  };
}
function json(body, status = 200) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json', ...cors() }, body: JSON.stringify(body) };
}
