export interface UserSession {
  userId: string;
  walletAddress: string;
}

export interface User {
  id: string;
  walletAddress: string;
  referralCode: string;
  referredById: string | null;
  status: 'active' | 'inactive' | 'blocked';
  internalBalance: number | string;
  blockedBalance: number | string;
  totalEarned: number | string;
  directReferralCount: number;
  createdAt: Date;
  updatedAt: Date;
}
