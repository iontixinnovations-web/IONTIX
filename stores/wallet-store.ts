/**
 * Zustand Wallet Store - GlowPay Digital Wallet
 * Balance management and transactions
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { walletService, type WalletTransaction } from "@/lib/api"

interface WalletState {
  // Balance info
  balance: number
  pendingBalance: number
  currency: string
  totalEarned: number
  totalSpent: number

  // Transactions
  transactions: WalletTransaction[]
  hasMoreTransactions: boolean
  transactionsPage: number

  // Loading states
  isLoading: boolean
  isLoadingTransactions: boolean
  isProcessing: boolean

  // Actions
  fetchBalance: () => Promise<void>
  fetchTransactions: (page?: number) => Promise<void>
  loadMoreTransactions: () => Promise<void>
  addFunds: (amount: number) => Promise<{ orderId: string; razorpayOrderId: string } | null>
  pay: (data: { amount: number; description: string; reference_id?: string }) => Promise<boolean>
  transfer: (data: { recipientId: string; amount: number; note?: string }) => Promise<boolean>
  updateBalance: (newBalance: number) => void
  addTransaction: (transaction: WalletTransaction) => void
}

export const useWalletStore = create<WalletState>()(
  devtools(
    (set, get) => ({
      // Initial State
      balance: 0,
      pendingBalance: 0,
      currency: "INR",
      totalEarned: 0,
      totalSpent: 0,
      transactions: [],
      hasMoreTransactions: true,
      transactionsPage: 1,
      isLoading: false,
      isLoadingTransactions: false,
      isProcessing: false,

      // Fetch wallet balance
      fetchBalance: async () => {
        set({ isLoading: true })
        try {
          const response = await walletService.getBalance()
          if (response.success && response.data) {
            set({
              balance: response.data.balance,
              pendingBalance: response.data.pending_balance,
              currency: response.data.currency,
              totalEarned: response.data.total_earned,
              totalSpent: response.data.total_spent,
            })
          }
        } catch (error) {
          console.error("[Wallet] Fetch balance failed:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Fetch transactions
      fetchTransactions: async (page = 1) => {
        set({ isLoadingTransactions: true })
        try {
          const response = await walletService.getTransactions({
            page,
            limit: 20,
          })
          if (response.success && response.data) {
            set((state) => ({
              transactions: page === 1 ? response.data! : [...state.transactions, ...response.data!],
              transactionsPage: page,
              hasMoreTransactions: response.data!.length === 20,
            }))
          }
        } catch (error) {
          console.error("[Wallet] Fetch transactions failed:", error)
        } finally {
          set({ isLoadingTransactions: false })
        }
      },

      // Load more transactions
      loadMoreTransactions: async () => {
        const { transactionsPage, hasMoreTransactions, isLoadingTransactions } = get()
        if (!hasMoreTransactions || isLoadingTransactions) return
        await get().fetchTransactions(transactionsPage + 1)
      },

      // Add funds (initiate Razorpay)
      addFunds: async (amount) => {
        set({ isProcessing: true })
        try {
          const response = await walletService.addFunds(amount)
          if (response.success && response.data) {
            return {
              orderId: response.data.order_id,
              razorpayOrderId: response.data.razorpay_order_id,
            }
          }
          return null
        } catch (error) {
          console.error("[Wallet] Add funds failed:", error)
          return null
        } finally {
          set({ isProcessing: false })
        }
      },

      // Pay from wallet
      pay: async (data) => {
        const { balance } = get()
        if (balance < data.amount) {
          console.error("[Wallet] Insufficient balance")
          return false
        }

        set({ isProcessing: true })
        try {
          const response = await walletService.pay(data)
          if (response.success && response.data) {
            set({ balance: response.data.new_balance })
            // Refresh transactions
            get().fetchTransactions(1)
            return true
          }
          return false
        } catch (error) {
          console.error("[Wallet] Payment failed:", error)
          return false
        } finally {
          set({ isProcessing: false })
        }
      },

      // Transfer to another user
      transfer: async (data) => {
        const { balance } = get()
        if (balance < data.amount) {
          console.error("[Wallet] Insufficient balance")
          return false
        }

        set({ isProcessing: true })
        try {
          const response = await walletService.transfer({
            recipient_id: data.recipientId,
            amount: data.amount,
            note: data.note,
          })
          if (response.success && response.data) {
            set({ balance: response.data.new_balance })
            get().fetchTransactions(1)
            return true
          }
          return false
        } catch (error) {
          console.error("[Wallet] Transfer failed:", error)
          return false
        } finally {
          set({ isProcessing: false })
        }
      },

      // Update balance (from realtime)
      updateBalance: (newBalance) => {
        set({ balance: newBalance })
      },

      // Add new transaction (from realtime)
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }))
      },
    }),
    { name: "WalletStore" },
  ),
)
