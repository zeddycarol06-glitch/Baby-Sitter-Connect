import { DEFAULT_COMMISSION_RATE, SERVICE_FEE_RATE } from "@/lib/constants";
import { hoursBetween } from "@/lib/format";

export interface PriceBreakdown {
  hours: number;
  hourlyRate: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  commission: number;
  sitterEarnings: number;
}

export function calculatePrice(
  hourlyRate: number,
  startTime: string,
  endTime: string,
  serviceFeeRate = SERVICE_FEE_RATE,
  commissionRate = DEFAULT_COMMISSION_RATE,
): PriceBreakdown {
  const hours = hoursBetween(startTime, endTime);
  const subtotal = Math.round(hourlyRate * hours * 100) / 100;
  const serviceFee = Math.round(subtotal * serviceFeeRate * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;
  const commission = Math.round(subtotal * commissionRate * 100) / 100;

  return {
    hours,
    hourlyRate,
    subtotal,
    serviceFee,
    total,
    commission,
    sitterEarnings: Math.round((subtotal - commission) * 100) / 100,
  };
}
