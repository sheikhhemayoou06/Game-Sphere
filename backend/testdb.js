const { Client } = require('pg');
const url = `postgresql://postgres:kofPo9-nejtab-pybnix@db.fikwgmxcyilxxheyjfgm.supabase.co:5432/postgres`;
const client = new Client({ connectionString: url });
client.connect()
  .then(() => console.log("[TEST] DIRECT_URL WORKS!"))
  .catch(err => console.log("[TEST] DIRECT_URL ERROR:", err.message))
  .finally(() => client.end());
