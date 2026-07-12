const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  
  // Fake the token for the request?
  // We can just hit it with fetch if we bypass auth, but wait, if it's the backend we can't easily bypass.
  // Let's just generate a token via the login route first.
  
  fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: admin.email, password: 'admin123' })
  })
  .then(res => {
    const cookies = res.headers.get('set-cookie');
    return fetch('http://localhost:4000/api/audits', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ name: 'Fetch Test Audit' })
    });
  })
  .then(async res => {
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  });
}
run();
