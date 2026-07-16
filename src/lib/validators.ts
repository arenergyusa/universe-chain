import { z } from 'zod';

// Common wallet address validator
const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
const signatureRegex = /^0x[a-fA-F0-9]{130}$/;

export const authVerifySchema = z.object({
  message: z.string().min(1, 'Message is required'),
  signature: z.string().regex(signatureRegex, 'Invalid cryptographic signature format'),
  referrerCode: z.string().optional().nullable(),
});

export const withdrawSchema = z.object({
  address: z.string().regex(evmAddressRegex, 'Invalid destination wallet address'),
  amount: z.number().positive().min(10, 'Minimum withdrawal amount is 10 USDT'),
});

export const depositVerifySchema = z.object({
  txHash: z.string().regex(/^0x([A-Fa-f0-9]{64})$/, 'Invalid transaction hash format'),
});

export const configUpdateSchema = z.object({
  key: z.string().min(1, 'Config key is required').max(100, 'Config key is too long'),
  value: z.string().min(1, 'Config value is required'),
  description: z.string().optional().nullable(),
});

export const slotActionSchema = z.object({
  type: z.enum(['activate', 'retop']),
});
