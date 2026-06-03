import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const token = 'INVALID_TOKEN_FOR_TESTING';

  console.log('Testing with secret:', secret ? 'Set' : 'Missing');

  const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'secret=' + secret + '&response=' + token,
  });
  const recaptchaData = await recaptchaRes.json();
  console.log('Result:', recaptchaData);
}

test();
