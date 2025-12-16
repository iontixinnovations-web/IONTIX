"use client"

/**
 * Booking Hooks
 * Salon booking with Google Calendar integration via FastAPI
 */

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import {
  bookingService,
  geoService,
  type Salon,
  type SalonWithDistance,
  type Service,
  type TimeSlot,
  type Booking,
  type CreateBookingData,
} from "@/lib/api"
import { toast } from "sonner"

export function useSalons(params?: { city?: string; page?: number; limit?: number }) {
  const { data, error, isLoading, mutate } = useSWR<Salon[]>(
    `/booking/salons?city=${params?.city || ""}`,
    async () => {
      const response = await bookingService.salons.list(params)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  return { salons: data || [], isLoading, error, refetch: mutate }
}

export function useNearbySalons(lat?: number, lng?: number, radiusKm?: number) {
  const { data, error, isLoading, mutate } = useSWR<SalonWithDistance[]>(
    lat && lng ? `/geo/nearby-salons?lat=${lat}&lng=${lng}` : null,
    async () => {
      const response = await geoService.nearbySalons(lat!, lng!, radiusKm)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  return { salons: data || [], isLoading, error, refetch: mutate }
}

export function useSalon(salonId: string) {
  const { data, error, isLoading } = useSWR<Salon>(
    salonId ? `/booking/salons/${salonId}` : null,
    async () => {
      const response = await bookingService.salons.get(salonId)
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: false },
  )

  return { salon: data, isLoading, error }
}

export function useSalonServices(salonId: string) {
  const { data, error, isLoading } = useSWR<Service[]>(
    salonId ? `/booking/salons/${salonId}/services` : null,
    async () => {
      const response = await bookingService.salons.getServices(salonId)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  return { services: data || [], isLoading, error }
}

export function useAvailableSlots(salonId: string, serviceId: string, date: string) {
  const { data, error, isLoading, mutate } = useSWR<TimeSlot[]>(
    salonId && serviceId && date ? `/booking/salons/${salonId}/slots?service=${serviceId}&date=${date}` : null,
    async () => {
      const response = await bookingService.salons.getSlots(salonId, { service_id: serviceId, date })
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  return { slots: data || [], isLoading, error, refetch: mutate }
}

export function useBookingSlots(salonId: string, date: string) {
  const { data, error, isLoading, mutate } = useSWR<string[]>(
    salonId && date ? `/booking/salons/${salonId}/available-slots?date=${date}` : null,
    async () => {
      const response = await bookingService.salons.getSlots(salonId, { date })
      if (!response.success) throw new Error(response.error)
      // Extract time strings from slots
      const slots = response.data || []
      return slots.map((slot: TimeSlot | string) => (typeof slot === "string" ? slot : slot.time || slot.start_time))
    },
    { revalidateOnFocus: false },
  )

  return { slots: data || [], isLoading, error, refetch: mutate }
}

export function useMyBookings(params?: { status?: string; page?: number }) {
  const { data, error, isLoading, mutate } = useSWR<Booking[]>(
    `/booking/my-bookings`,
    async () => {
      const response = await bookingService.bookings.myBookings(params)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: true },
  )

  return { bookings: data || [], isLoading, error, refetch: mutate }
}

export function useCreateBooking() {
  const create = useSWRMutation(
    "/booking/create",
    async (_, { arg }: { arg: CreateBookingData }) => {
      const response = await bookingService.bookings.create(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => toast.success("Booking confirmed!"),
      onError: (err) => toast.error(err.message || "Booking failed"),
    },
  )

  return {
    createBooking: create.trigger,
    book: create.trigger,
    isCreating: create.isMutating,
    isBooking: create.isMutating,
    booking: create.data,
    error: create.error,
  }
}

export function useCancelBooking() {
  const cancel = useSWRMutation(
    "/booking/cancel",
    async (_, { arg }: { arg: { bookingId: string; reason?: string } }) => {
      const response = await bookingService.bookings.cancel(arg.bookingId, arg.reason)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => toast.success("Booking cancelled"),
      onError: (err) => toast.error(err.message || "Cancellation failed"),
    },
  )

  return {
    cancelBooking: cancel.trigger,
    isCancelling: cancel.isMutating,
    error: cancel.error,
  }
}
