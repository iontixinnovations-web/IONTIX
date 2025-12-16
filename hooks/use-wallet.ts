"use client"

/**
 * Wallet Hook
 * GlowPay wallet management with full backend integration
 */

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { walletService, type WalletBalance, type WalletTransaction } from "@/lib/api"
import { toast } from "sonner"

export function useWallet() {
  const { data, error, isLoading, mutate } = useSWR<WalletBalance>(
    "/wallet/balance",
    async () => {
      const response = await walletService.getBalance()
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: true },
  )

  return {
    wallet: data,
    balance: data?.balance || 0,
    currency: data?.currency || "INR",
    pendingBalance: data?.pending_balance || 0,
    totalEarned: data?.total_earned || 0,
    totalSpent: data?.total_spent || 0,
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useWalletTransactions(params?: { type?: "credit" | "debit"; page?: number; limit?: number }) {
  const { data, error, isLoading, mutate } = useSWR<WalletTransaction[]>(
    `/wallet/transactions?type=${params?.type || ""}`,
    async () => {
      const response = await walletService.getTransactions(params)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: true },
  )

  return { transactions: data || [], isLoading, error, refetch: mutate }
}

export function useAddFunds() {
  const { mutate } = useSWR("/wallet/balance")

  const addFunds = useSWRMutation(
    "/wallet/add-funds",
    async (_, { arg }: { arg: number }) => {
      const response = await walletService.addFunds(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Funds added successfully!")
      },
      onError: (err) => toast.error(err.message || "Failed to add funds"),
    },
  )

  return {
    addFunds: addFunds.trigger,
    isAdding: addFunds.isMutating,
    data: addFunds.data,
    error: addFunds.error,
  }
}

export function useAddMoney() {
  const { mutate } = useSWR("/wallet/balance")

  const addMoney = useSWRMutation(
    "/wallet/add-funds",
    async (_, { arg }: { arg: { amount: number; method?: string } }) => {
      const response = await walletService.addFunds(arg.amount)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Money added successfully!")
      },
      onError: (err) => toast.error(err.message || "Failed to add money"),
    },
  )

  return {
    addMoney: addMoney.trigger,
    isAdding: addMoney.isMutating,
    data: addMoney.data,
    error: addMoney.error,
  }
}

export function useWithdrawMoney() {
  const { mutate } = useSWR("/wallet/balance")

  const withdraw = useSWRMutation(
    "/wallet/payout",
    async (_, { arg }: { arg: { amount: number; method?: string; bank_account_id?: string } }) => {
      const response = await walletService.requestPayout({
        amount: arg.amount,
        bank_account_id: arg.bank_account_id || "default",
      })
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Withdrawal request submitted!")
      },
      onError: (err) => toast.error(err.message || "Withdrawal failed"),
    },
  )

  return {
    withdraw: withdraw.trigger,
    isWithdrawing: withdraw.isMutating,
    data: withdraw.data,
    error: withdraw.error,
  }
}

export function useWalletPay() {
  const { mutate } = useSWR("/wallet/balance")

  const pay = useSWRMutation(
    "/wallet/pay",
    async (
      _,
      {
        arg,
      }: {
        arg: {
          amount: number
          description: string
          reference_id?: string
          reference_type?: string
        }
      },
    ) => {
      const response = await walletService.pay(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Payment successful!")
      },
      onError: (err) => toast.error(err.message || "Payment failed"),
    },
  )

  return {
    pay: pay.trigger,
    isPaying: pay.isMutating,
    data: pay.data,
    error: pay.error,
  }
}
