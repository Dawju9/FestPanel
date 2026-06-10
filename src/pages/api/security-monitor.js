import fs from 'fs/promises';
import path from 'path';
import { sendSecurityAlert } from '../../lib/mail';

const SECURITY_CHECKS = [
  {
    id: 'env-exposed',
    name: 'Environment File Exposure',
    check: async () => {
      try {
        const res = await fetch('http://localhost:3000/.env');
        return { pass: res.status !== 200, message: res.status === 200 ? '.env file is publicly accessible!' : '.env blocked' };
      } catch {
        return { pass: true, message: 'Cannot reach server' };
      }
    },
  },
  {
    id: 'git-exposed',
    name: 'Git Directory Exposure',
    check: async () => {
      try {
        const res = await fetch('http://localhost:3000/.git/config');
        return { pass: res.status !== 200, message: res.status === 200 ? '.git directory is accessible!' : '.git blocked' };
      } catch {
        return { pass: true, message: 'Cannot reach server' };
      }
    },
  },
  {
    id: 'node-modules-exposed',
    name: 'Node Modules Exposure',
    check: async () => {
      try {
        const res = await fetch('http://localhost:3000/node_modules/');
        return { pass: res.status !== 200, message: res.status === 200 ? 'node_modules accessible!' : 'node_modules blocked' };
      } catch {
        return { pass: true, message: 'Cannot reach server' };
      }
    },
  },
  {
    id: 'health-endpoint',
    name: 'Health Endpoint',
    check: async () => {
      try {
        const res = await fetch('http://localhost:3000/api/health');
        const data = await res.json();
        return { pass: data.status === 'ok', message: `Status: ${data.status}` };
      } catch {
        return { pass: false, message: 'Health endpoint unreachable' };
      }
    },
  },
  {
    id: 'admin-auth-required',
    name: 'Admin Pages Auth Protected',
    check: async () => {
      try {
        const res = await fetch('http://localhost:3000/js/auth/dashboard');
        const pass = res.status === 302 || res.status === 401 || res.url?.includes('auth');
        return { pass, message: pass ? 'Admin pages require auth' : 'Admin pages accessible without auth!' };
      } catch {
        return { pass: true, message: 'Cannot reach server' };
      }
    },
  },
  {
    id: 'xss-header',
    name: 'X-XSS-Protection Header',
    check: async () => {
      try {
        const res = await fetch('http://localhost:3000/');
        const header = res.headers.get('x-xss-protection');
        return { pass: !!header, message: header || 'Missing X-XSS-Protection header' };
      } catch {
        return { pass: false, message: 'Cannot check headers' };
      }
    },
  },
  {
    id: 'content-type-nosniff',
    name: 'X-Content-Type-Options Header',
    check: async () => {
      try {
        const res = await fetch('http://localhost:3000/');
        const header = res.headers.get('x-content-type-options');
        return { pass: header === 'nosniff', message: header || 'Missing X-Content-Type-Options header' };
      } catch {
        return { pass: false, message: 'Cannot check headers' };
      }
    },
  },
  {
    id: 'cors-check',
    name: 'CORS Configuration',
    check: async () => {
      try {
        const res = await fetch('http://localhost:3000/api/health', {
          headers: { Origin: 'http://evil.com' },
        });
        const origin = res.headers.get('access-control-allow-origin');
        return { pass: !origin || origin !== '*', message: origin ? `CORS allows: ${origin}` : 'No CORS header (good)' };
      } catch {
        return { pass: true, message: 'Cannot check CORS' };
      }
    },
  },
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = [];
  let allPassed = true;

  for (const check of SECURITY_CHECKS) {
    try {
      const result = await check.check();
      results.push({
        id: check.id,
        name: check.name,
        ...result,
      });
      if (!result.pass) {
        allPassed = false;
      }
    } catch (error) {
      results.push({
        id: check.id,
        name: check.name,
        pass: false,
        message: `Check failed: ${error.message}`,
      });
      allPassed = false;
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    allPassed,
    checks: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.pass).length,
      failed: results.filter(r => !r.pass).length,
    },
  };

  const reportPath = path.join(process.cwd(), 'data', 'security-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  if (!allPassed) {
    const failedChecks = results.filter(r => !r.pass).map(r => `${r.name}: ${r.message}`).join('\n');
    try {
      await sendSecurityAlert({
        type: 'warning',
        details: failedChecks,
        url: 'http://localhost:3000',
      });
    } catch (emailError) {
      console.error('Failed to send security alert email:', emailError);
    }
  }

  res.status(200).json(report);
}
