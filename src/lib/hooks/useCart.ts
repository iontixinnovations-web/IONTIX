/**
 * Cart Hook
 * Manages shopping cart operations
 */

import { useState, useEffect } from 'react';
import { useAuthStore, useCartStore } from '../store';
import { supabase } from '../supabase';
import { toast } from 'sonner@2.0.3';
import type { Database } from '../database.types';

type CartItem = Database['public']['Tables']['cart']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export function useCart() {
  const { user } = useAuthStore();
  const { items, itemCount, subtotal, setItems, addItem, removeItem, updateQuantity, clearCart, calculateSubtotal } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items from database
  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        setItems(data as CartItemWithProduct[]);
        return { success: true, data };
      }

      return { success: false, error: 'Failed to fetch cart' };
    } catch (err: any) {
      console.error('Fetch cart error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('variant_id', variantId || null)
        .single();

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select(`
            *,
            product:products(*)
          `)
          .single();

        if (error) throw error;

        if (data) {
          // Update local state
          updateQuantity(existing.id, existing.quantity + quantity);
          toast.success('Cart updated!');
          return { success: true, data };
        }
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId || null,
            quantity,
          })
          .select(`
            *,
            product:products(*)
          `)
          .single();

        if (error) throw error;

        if (data) {
          addItem(data as CartItemWithProduct);
          toast.success('Added to cart! 🛒');
          return { success: true, data };
        }
      }

      return { success: false, error: 'Failed to add to cart' };
    } catch (err: any) {
      console.error('Add to cart error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to add to cart');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      removeItem(cartItemId);
      toast.success('Removed from cart');
      return { success: true };
    } catch (err: any) {
      console.error('Remove from cart error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to remove from cart');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;

      updateQuantity(cartItemId, quantity);
      return { success: true };
    } catch (err: any) {
      console.error('Update quantity error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to update quantity');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCartItems = async () => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      clearCart();
      toast.success('Cart cleared');
      return { success: true };
    } catch (err: any) {
      console.error('Clear cart error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to clear cart');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Sync cart on user change
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      clearCart();
    }
  }, [user?.id]);

  return {
    // State
    items,
    itemCount,
    subtotal,
    isLoading,
    error,

    // Actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCartItems,
    refetch: fetchCart,
  };
}
