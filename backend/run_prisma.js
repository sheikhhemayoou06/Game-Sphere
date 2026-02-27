const { execSync } = require('child_process');
try {
  // Use dns.lookup to resolve to IPv4, then connect using the explicit IPv4 address
  const dns = require('dns');
  dns.lookup('db.fikwgmxcyilxxheyjfgm.supabase.co', { family: 4 }, (err, address) => {
    if (err) {
       console.error("DNS failed:", err); process.exit(1);
    }
    const ipv4_url = `postgresql://postgres:kofPo9-nejtab-pybnix@[${address}]:5432/postgres`;
    console.log("Running Prisma push against IPv4: ", address);
    execSync(`npx prisma db push --accept-data-loss`, {
       env: { ...process.env, DATABASE_URL: ipv4_url, DIRECT_URL: ipv4_url },
       stdio: 'inherit'
    });
  });
} catch (e) {
  console.log(e);
}
