import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function signAccessToken(userId:number): Promise<Error | string> {      
        return new Promise((resolve, reject) => {
          jwt.sign(
            { userId },
            crypto.randomBytes(32).toString('hex'),
            {
              expiresIn: '0.25h',
            },
            (err, token) => {
              if (err) {
                reject(err);
              } else {
                resolve(token);
              }
            }
          );
        });
    }