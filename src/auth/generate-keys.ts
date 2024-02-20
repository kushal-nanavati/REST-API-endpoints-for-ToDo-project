import crypto from 'crypto';
import fs from 'fs';

const access_token_secret = crypto.randomBytes(32).toString('hex');
fs.writeFileSync('.env', access_token_secret);