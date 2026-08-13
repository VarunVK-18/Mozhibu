import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  priceInPaise: number;
  priceDisplay: string;
  currency: string;
  durationDays: number;
  marketingBenefits: string[];
  structuredBenefits: any;
  isActive: boolean;
}

export interface UserSubscription {
  active: boolean;
  subscription: {
    plan: SubscriptionPlan;
    startDate: string;
    endDate: string;
    status: string;
    autoRenew: boolean;
    daysRemaining: number;
    razorpayOrderId?: string;
  } | null;
}

export interface CouponValidation {
  valid: boolean;
  discountType: 'percent' | 'flat';
  discountValue: number;
  originalPriceInPaise: number;
  finalPriceInPaise: number;
  savings: number;
  savingsDisplay: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private api = inject(ApiService);

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.api.get('/subscriptions/plans');
  }

  validateCoupon(code: string, planId: string): Observable<CouponValidation> {
    return this.api.post('/subscriptions/coupon/validate', { code, planId });
  }

  createOrder(planId: string, couponCode?: string): Observable<any> {
    return this.api.post('/subscriptions/purchase', { planId, couponCode });
  }

  verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    planId: string;
    couponCode?: string;
  }): Observable<any> {
    return this.api.post('/subscriptions/verify', data);
  }

  getMySubscription(): Observable<UserSubscription> {
    return this.api.get('/subscriptions/me');
  }

  cancelAutoRenew(): Observable<any> {
    return this.api.post('/subscriptions/me/cancel', {});
  }

  getPaymentHistory(): Observable<any[]> {
    return this.api.get('/subscriptions/me/history');
  }

  getMyEarnings(): Observable<any> {
    return this.api.get('/earnings/me');
  }

  getEarningsProjection(): Observable<any> {
    return this.api.get('/earnings/me/projection');
  }

  requestWithdrawal(): Observable<any> {
    return this.api.post('/earnings/withdraw', {});
  }

  getMyRewards(): Observable<any> {
    return this.api.get('/rewards/me');
  }

  trackReadEvent(bookId: string, chapterId: string, completionPercent: number, timeOnPageSeconds: number): Observable<any> {
    return this.api.post('/rewards/track-read', { bookId, chapterId, completionPercent, timeOnPageSeconds });
  }
}
