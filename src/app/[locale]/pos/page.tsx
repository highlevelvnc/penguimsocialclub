'use client'

import { useState, useEffect, useCallback } from 'react'
import { useT } from '@/lib/i18n/client'
import { createClient } from '@/lib/supabase/client'
import { SHOP_ID } from '@/lib/constants'
import type { Member, Product } from '@/lib/supabase/types'
import { addToCart, removeFromCart, clearCart, EMPTY_CART, type CartState } from '@/lib/pos/cart'
import { getRemainingLimits, checkLimit, type MemberLimits } from '@/lib/pos/limits'
import { checkout } from '@/actions/pos'
import { PosMemberSearch } from '@/components/pos/member-search'
import { PosMemberCard } from '@/components/pos/member-card'
import { PosProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { CheckoutConfirmation } from '@/components/pos/checkout-confirmation'
import { toast } from 'sonner'

type PosPhase = 'search' | 'dispensing' | 'confirmation'

interface SubcategoryInfo {
  id: string
  key: string
  category: string
}

export default function PosPage() {
  const t = useT()

  // -- Core state --
  const [phase, setPhase] = useState<PosPhase>('search')
  const [member, setMember] = useState<Member | null>(null)
  const [limits, setLimits] = useState<MemberLimits | null>(null)
  const [lastVisit, setLastVisit] = useState<string | null>(null)
  const [cart, setCart] = useState<CartState>(EMPTY_CART)
  const [products, setProducts] = useState<Product[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryInfo[]>([])
  const [checkingOut, setCheckingOut] = useState(false)

  // Checkout confirmation data
  const [confirmationData, setConfirmationData] = useState<{
    totalAmount: number
    cannabisGrams: number
    paymentMethod: 'cash' | 'card'
    memberName: string
  } | null>(null)

  // -- Load products once --
  useEffect(() => {
    loadProducts()
  }, [])

  function loadProducts() {
    const supabase = createClient()
    Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('shop_id', SHOP_ID)
        .eq('active', true)
        .order('category')
        .order('sort_order')
        .order('name'),
      supabase
        .from('subcategories')
        .select('id, key, category')
        .eq('shop_id', SHOP_ID)
        .eq('active', true),
    ]).then(([prodResult, subResult]) => {
      setProducts((prodResult.data as Product[] | null) ?? [])
      setSubcategories((subResult.data as SubcategoryInfo[] | null) ?? [])
    })
  }

  // -- Member selection --
  const handleMemberSelect = useCallback(async (selectedMember: Member) => {
    setMember(selectedMember)
    setCart(clearCart())

    const supabase = createClient()

    // Fetch dispensing totals
    const [todayRes, monthRes] = await Promise.all([
      supabase.rpc('get_member_dispensed_today', {
        p_member_id: selectedMember.id,
        p_shop_id: SHOP_ID,
      }),
      supabase.rpc('get_member_dispensed_month', {
        p_member_id: selectedMember.id,
        p_shop_id: SHOP_ID,
      }),
    ])

    setLimits({
      dailyLimit: selectedMember.daily_limit_grams,
      monthlyLimit: selectedMember.monthly_limit_grams,
      dispensedToday: (todayRes.data as number) ?? 0,
      dispensedMonth: (monthRes.data as number) ?? 0,
    })

    // Fetch last visit
    const { data: lastTxn } = await supabase
      .from('transactions')
      .select('created_at, total_amount, cannabis_grams_total')
      .eq('member_id', selectedMember.id)
      .eq('shop_id', SHOP_ID)
      .order('created_at', { ascending: false })
      .limit(1)

    const last = (lastTxn as { created_at: string; total_amount: number; cannabis_grams_total: number }[] | null)
    if (last && last.length > 0) {
      const d = new Date(last[0].created_at)
      setLastVisit(
        `${d.toLocaleDateString('es-ES')} \u2014 ${last[0].cannabis_grams_total}g, \u20AC${last[0].total_amount.toFixed(2)}`
      )
    } else {
      setLastVisit(null)
    }

    setPhase('dispensing')
  }, [])

  // -- Cart operations --
  function handleAddGramProduct(product: Product, grams: number) {
    if (!limits) return

    const check = checkLimit(limits, cart.cannabisGramsTotal, product, grams)
    if (!check.allowed) {
      toast.error(
        check.reason === 'daily'
          ? t('pos.error.limit_daily', { remaining: (check.maxQuantity ?? 0).toString() })
          : t('pos.error.limit_monthly', { remaining: (check.maxQuantity ?? 0).toString() })
      )
      return
    }

    if (grams > product.stock_quantity) {
      toast.error(t('pos.error.out_of_stock'))
      return
    }

    setCart((prev) => addToCart(prev, product, grams))
  }

  function handleAddUnitProduct(product: Product, quantity: number) {
    if (!limits) return

    const check = checkLimit(limits, cart.cannabisGramsTotal, product, quantity)
    if (!check.allowed) {
      toast.error(
        check.reason === 'daily'
          ? t('pos.error.limit_daily', { remaining: (check.maxQuantity ?? 0).toString() })
          : t('pos.error.limit_monthly', { remaining: (check.maxQuantity ?? 0).toString() })
      )
      return
    }

    if (quantity > product.stock_quantity) {
      toast.error(t('pos.error.out_of_stock'))
      return
    }

    setCart((prev) => addToCart(prev, product, quantity))
  }

  function handleRemoveItem(cartItemId: string) {
    setCart((prev) => removeFromCart(prev, cartItemId))
  }

  function handleClearCart() {
    setCart(clearCart())
  }

  // -- Real checkout --
  async function handleCheckout(method: 'cash' | 'card') {
    if (!member || cart.items.length === 0) return

    setCheckingOut(true)

    const result = await checkout({
      shopId: SHOP_ID,
      memberId: member.id,
      paymentMethod: method,
      items: cart.items,
    })

    setCheckingOut(false)

    if (!result.success) {
      // Translate the error and show toast — cart stays intact
      switch (result.error) {
        case 'MEMBER_NOT_ACTIVE':
          toast.error(t('pos.error.member_not_active'))
          break
        case 'MEMBERSHIP_EXPIRED':
          toast.error(t('pos.error.membership_expired'))
          break
        case 'DAILY_LIMIT_EXCEEDED':
          toast.error(t('pos.error.limit_daily', { remaining: (result.remaining ?? 0).toString() }))
          break
        case 'MONTHLY_LIMIT_EXCEEDED':
          toast.error(t('pos.error.limit_monthly', { remaining: (result.remaining ?? 0).toString() }))
          break
        case 'INSUFFICIENT_STOCK':
          toast.error(t('pos.error.out_of_stock'))
          break
        default:
          toast.error(t('pos.error.checkout_failed'))
          break
      }
      return
    }

    // Success — show confirmation
    setConfirmationData({
      totalAmount: cart.totalAmount,
      cannabisGrams: cart.cannabisGramsTotal,
      paymentMethod: method,
      memberName: member.full_name,
    })
    setCart(clearCart())
    setPhase('confirmation')
  }

  // -- Reset for next transaction --
  function handleNext() {
    setPhase('search')
    setMember(null)
    setLimits(null)
    setLastVisit(null)
    setCart(clearCart())
    setConfirmationData(null)

    // Refetch products (updated stock after checkout)
    loadProducts()
  }

  function handleChangeMember() {
    setPhase('search')
    setMember(null)
    setLimits(null)
    setLastVisit(null)
    setCart(clearCart())
  }

  // -- Remaining limits (real-time, accounts for cart) --
  const remaining = limits
    ? getRemainingLimits(limits, cart.cannabisGramsTotal)
    : { daily: 0, monthly: 0 }

  // Min of daily/monthly remaining for product grid limit enforcement
  const maxCannabisGrams = limits
    ? Math.min(remaining.daily, remaining.monthly)
    : null

  // ---- RENDER ----

  if (phase === 'confirmation' && confirmationData) {
    return (
      <CheckoutConfirmation
        totalAmount={confirmationData.totalAmount}
        cannabisGrams={confirmationData.cannabisGrams}
        paymentMethod={confirmationData.paymentMethod}
        memberName={confirmationData.memberName}
        onNext={handleNext}
      />
    )
  }

  if (phase === 'search' || !member || !limits) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-center text-lg text-muted-foreground">
            {t('pos.select_member')}
          </h2>
          <PosMemberSearch onSelect={handleMemberSelect} />
        </div>
      </div>
    )
  }

  // phase === 'dispensing'
  return (
    <div className="flex h-full">
      {/* Left: member card + product grid */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Member card */}
        <div className="p-3 pb-0">
          <PosMemberCard
            member={member}
            limits={limits}
            remainingDaily={remaining.daily}
            remainingMonthly={remaining.monthly}
            lastVisit={lastVisit}
            onChangeMember={handleChangeMember}
          />
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-hidden mt-3">
          <PosProductGrid
            products={products}
            subcategories={subcategories}
            maxCannabisGrams={maxCannabisGrams}
            onAddGramProduct={handleAddGramProduct}
            onAddUnitProduct={handleAddUnitProduct}
          />
        </div>
      </div>

      {/* Right: cart panel */}
      <div className="w-80 shrink-0 lg:w-96">
        <CartPanel
          cart={cart}
          remainingDaily={remaining.daily}
          remainingMonthly={remaining.monthly}
          memberName={member.full_name}
          checkingOut={checkingOut}
          onRemoveItem={handleRemoveItem}
          onClear={handleClearCart}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  )
}
