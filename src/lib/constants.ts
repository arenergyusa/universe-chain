// Common application constants

export const APP_CONFIG = {
  name: 'Universe Chain',
  description: 'Secure Web3 Ecosystem',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://universechain.online',
};

export const WITHDRAWAL_LIMITS = {
  MIN: 10,
  FEE_PERCENTAGE: 10,
};

export const CONTRACT_ADDRESSES = {
  USDT: process.env.USDT_CONTRACT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955',
};

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
};
