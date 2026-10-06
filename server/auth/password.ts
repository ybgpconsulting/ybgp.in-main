import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const scryptCost = 16_384;
const scryptBlockSize = 8;
const scryptParallelization = 1;
const keyLength = 64;

const deriveKey = (
  password: string,
  salt: Buffer,
  length: number,
  cost: number,
  blockSize: number,
  parallelization: number
): Promise<Buffer> => new Promise((resolve, reject) => {
  scryptCallback(
    password,
    salt,
    length,
    { N: cost, r: blockSize, p: parallelization },
    (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    }
  );
});

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const key = await deriveKey(
    password,
    salt,
    keyLength,
    scryptCost,
    scryptBlockSize,
    scryptParallelization
  );

  return `$scrypt$${scryptCost}$${scryptBlockSize}$${scryptParallelization}$${salt.toString('hex')}$${key.toString('hex')}`;
};

export const verifyPassword = async (password: string, passwordHash: string): Promise<boolean> => {
  const parts = passwordHash.split('$');
  if (parts.length !== 7 || parts[1] !== 'scrypt') return false;

  const cost = Number(parts[2]);
  const blockSize = Number(parts[3]);
  const parallelization = Number(parts[4]);
  const saltHex = parts[5];
  const keyHex = parts[6];

  if (
    !Number.isSafeInteger(cost) ||
    cost < 16_384 ||
    cost > 262_144 ||
    (cost & (cost - 1)) !== 0 ||
    !Number.isSafeInteger(blockSize) ||
    blockSize < 1 ||
    blockSize > 16 ||
    !Number.isSafeInteger(parallelization) ||
    parallelization < 1 ||
    parallelization > 4 ||
    !/^(?:[a-f\d]{2}){16,64}$/i.test(saltHex) ||
    !/^(?:[a-f\d]{2}){32,128}$/i.test(keyHex)
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expectedKey = Buffer.from(keyHex, 'hex');
    const actualKey = await deriveKey(
      password,
      salt,
      expectedKey.length,
      cost,
      blockSize,
      parallelization
    );
    return actualKey.length === expectedKey.length && timingSafeEqual(actualKey, expectedKey);
  } catch {
    return false;
  }
};
