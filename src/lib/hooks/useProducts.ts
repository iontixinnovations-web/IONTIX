/**
 * Products Hook
 * Manages product fetching, filtering, and operations
 */

import { useState, useEffect } from 'react';
import { useShopStore } from '../store';
import { supabase } from '../supabase';
import { toast } from 'sonner@2.0.3';
import type { Database } from '../database.types';

type Product = Database['public']['Tables']['products']['Row'];

export function useProducts(options?: {
  category?: string;
  gender?: 'female' | 'male' | null;
  sellerId?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { products, setProducts } = useShopStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select('*, sellers(shop_name, is_verified, trust_score)')
        .eq('is_active', true)
        .eq('is_draft', false);

      // Apply filters
      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.gender) {
        query = query.eq('gender', options.gender);
      }

      if (options?.sellerId) {
        query = query.eq('seller_id', options.sellerId);
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      // Order by newest
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setProducts(data as Product[]);
        return { success: true, data };
      }

      return { success: false, error: 'No products found' };
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options?.enabled !== false) {
      fetchProducts();
    }
  }, [options?.category, options?.gender, options?.sellerId, options?.enabled]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*, sellers(shop_name, is_verified, trust_score, average_rating)')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        setProduct(data as Product);
        
        // Increment view count
        await supabase
          .from('products')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', productId);
        
        return { success: true, data };
      }

      return { success: false, error: 'Product not found' };
    } catch (err: any) {
      console.error('Fetch product error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct,
  };
}

export function useSearchProducts() {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return { success: true, data: [] };
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .eq('is_active', true)
        .eq('is_draft', false)
        .limit(20);

      if (error) throw error;

      if (data) {
        setResults(data);
        return { success: true, data };
      }

      return { success: false, error: 'No results found' };
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    search,
  };
}

export function useRecommendations(productId?: string) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);

      // Simple recommendation logic: same category or featured products
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_draft', false);

      if (productId) {
        // Get product to find similar
        const { data: product } = await supabase
          .from('products')
          .select('category, gender')
          .eq('id', productId)
          .single();

        if (product) {
          query = query
            .eq('category', product.category)
            .eq('gender', product.gender)
            .neq('id', productId);
        }
      } else {
        // Just get featured products
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query.limit(6);

      if (error) throw error;

      if (data) {
        setRecommendations(data);
      }
    } catch (err: any) {
      console.error('Fetch recommendations error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [productId]);

  return {
    recommendations,
    isLoading,
    refetch: fetchRecommendations,
  };
}
