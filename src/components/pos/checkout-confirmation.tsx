'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/client'
import { Receipt } from './receipt'

interface Props {
  transactionId: string
  totalAmount: number
  cannabisGrams: number
  paymentMethod: 'cash' | 'card'
  memberName: string
  pointsEarned: number
  onNext: () => void
}

export function CheckoutConfirmation({
  transactionId,
  totalAmount,
  cannabisGrams,
  paymentMethod,
  memberName,
  pointsEarned,
  onNext,
}: Props) {
  const t = useT()
  const [showReceipt, setShowReceipt] = useState(false)

  return (
    <>
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-sm text-center space-y-6 px-6">
          {/* Success icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-100">{t('pos.transaction_complete')}</h2>
            <p className="text-3xl font-bold text-white tabular-nums">
              {'\u20AC'}{totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Details */}
          <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{t('receipt.member')}</span>
              <span className="font-medium text-zinc-200">{memberName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{t('receipt.payment')}</span>
              <span className="font-medium text-zinc-200">
                {paymentMethod === 'cash' ? t('pos.checkout_cash') : t('pos.checkout_card')}
              </span>
            </div>
            {cannabisGrams > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Cannabis</span>
                <span className="font-medium text-zinc-200 tabular-nums">{cannabisGrams}g</span>
              </div>
            )}
          </div>

          {/* Points earned */}
          {pointsEarned > 0 && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm text-emerald-400">⭐ {t('loyalty.points')}</span>
              <span className="text-sm font-bold text-emerald-300">+{pointsEarned} pts</span>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2.5">
            {/* Print receipt */}
            <button
              type="button"
              className="w-full h-12 rounded-xl border border-zinc-700 bg-zinc-800/50 text-sm font-semibold text-zinc-200 transition-all hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2"
              onClick={() => setShowReceipt(true)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              {t('pos.print_receipt')}
            </button>

            {/* Next */}
            <button
              type="button"
              className="w-full h-14 rounded-xl bg-zinc-100 text-zinc-900 text-lg font-bold shadow-lg transition-all hover:bg-white active:scale-[0.98]"
              onClick={onNext}
            >
              {t('pos.next')} &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Receipt modal */}
      {showReceipt && (
        <Receipt
          transactionId={transactionId}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  )
}
