import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Coupon {
  _id?: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminCouponService {
  private api = inject(ApiService);

  getCoupons(): Observable<Coupon[]> {
    return this.api.get('/revenue/coupons');
  }

  createCoupon(couponData: any): Observable<Coupon> {
    return this.api.post('/revenue/coupons', couponData);
  }

  updateCoupon(id: string, couponData: any): Observable<Coupon> {
    return this.api.put(`/revenue/coupons/${id}`, couponData);
  }

  toggleCouponStatus(id: string, isActive: boolean): Observable<Coupon> {
    return this.api.put(`/revenue/coupons/${id}/status`, { isActive });
  }

  deleteCoupon(id: string): Observable<any> {
    return this.api.delete(`/revenue/coupons/${id}`);
  }
}
