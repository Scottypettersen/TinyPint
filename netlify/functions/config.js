// netlify/functions/config.js
exports.handler = async () => {
  const supabase = {
    url: 'https://rrxcdcdpvdqspmaanlnn.supabase.co',
    anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyeGNkY2RwdmRxc3BtYWFubG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTg1ODEsImV4cCI6MjA3NTg3NDU4MX0.5KrM2kiYJi9lRMHAi8jf22BAe_8iVVA7Rh1zedl131Y'
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ supabase })
  };
};
