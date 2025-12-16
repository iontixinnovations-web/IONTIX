/**
 * Zustand Booking Store - Salon Booking with Google Calendar
 * Artist booking management
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { bookingService, geoService, type Salon, type Service, type TimeSlot, type Booking } from "@/lib/api"

interface BookingState {
  // Salon data
  salons: Salon[]
  nearbySalons: Salon[]
  selectedSalon: Salon | null

  // Service selection
  services: Service[]
  selectedService: Service | null

  // Slot selection
  availableSlots: TimeSlot[]
  selectedDate: string | null
  selectedSlot: TimeSlot | null

  // User bookings
  myBookings: Booking[]

  // UI State
  isLoading: boolean
  isLoadingSlots: boolean
  isCreatingBooking: boolean

  // Location
  userLocation: { lat: number; lng: number } | null

  // Actions
  fetchSalons: (city?: string) => Promise<void>
  fetchNearbySalons: (lat: number, lng: number, radiusKm?: number) => Promise<void>
  selectSalon: (salon: Salon) => Promise<void>
  selectService: (service: Service) => void
  selectDate: (date: string) => Promise<void>
  selectSlot: (slot: TimeSlot) => void
  createBooking: (notes?: string) => Promise<Booking | null>
  cancelBooking: (bookingId: string, reason?: string) => Promise<boolean>
  fetchMyBookings: () => Promise<void>
  setUserLocation: (location: { lat: number; lng: number }) => void
  resetSelection: () => void
}

export const useBookingStore = create<BookingState>()(
  devtools(
    (set, get) => ({
      // Initial State
      salons: [],
      nearbySalons: [],
      selectedSalon: null,
      services: [],
      selectedService: null,
      availableSlots: [],
      selectedDate: null,
      selectedSlot: null,
      myBookings: [],
      isLoading: false,
      isLoadingSlots: false,
      isCreatingBooking: false,
      userLocation: null,

      // Fetch all salons
      fetchSalons: async (city) => {
        set({ isLoading: true })
        try {
          const response = await bookingService.salons.list({ city })
          if (response.success && response.data) {
            set({ salons: response.data })
          }
        } catch (error) {
          console.error("[Booking] Fetch salons failed:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Fetch nearby salons using PostGIS
      fetchNearbySalons: async (lat, lng, radiusKm = 10) => {
        set({ isLoading: true })
        try {
          const response = await geoService.nearbySalons(lat, lng, radiusKm)
          if (response.success && response.data) {
            set({ nearbySalons: response.data })
          }
        } catch (error) {
          console.error("[Booking] Fetch nearby salons failed:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Select salon and load services
      selectSalon: async (salon) => {
        set({ selectedSalon: salon, isLoading: true })
        try {
          const response = await bookingService.salons.getServices(salon.id)
          if (response.success && response.data) {
            set({ services: response.data })
          }
        } catch (error) {
          console.error("[Booking] Fetch services failed:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Select service
      selectService: (service) => {
        set({
          selectedService: service,
          availableSlots: [],
          selectedSlot: null,
        })
      },

      // Select date and fetch available slots
      selectDate: async (date) => {
        const { selectedSalon, selectedService } = get()
        if (!selectedSalon || !selectedService) return

        set({ selectedDate: date, isLoadingSlots: true, selectedSlot: null })
        try {
          const response = await bookingService.salons.getSlots(selectedSalon.id, {
            service_id: selectedService.id,
            date,
          })
          if (response.success && response.data) {
            set({ availableSlots: response.data })
          }
        } catch (error) {
          console.error("[Booking] Fetch slots failed:", error)
        } finally {
          set({ isLoadingSlots: false })
        }
      },

      // Select time slot
      selectSlot: (slot) => {
        set({ selectedSlot: slot })
      },

      // Create booking (syncs with Google Calendar via FastAPI)
      createBooking: async (notes) => {
        const { selectedSalon, selectedService, selectedSlot } = get()
        if (!selectedSalon || !selectedService || !selectedSlot) return null

        set({ isCreatingBooking: true })
        try {
          const response = await bookingService.bookings.create({
            salon_id: selectedSalon.id,
            service_id: selectedService.id,
            slot_start: selectedSlot.start,
            slot_end: selectedSlot.end,
            staff_id: selectedSlot.staff_id,
            notes,
          })

          if (response.success && response.data) {
            // Add to my bookings
            set((state) => ({
              myBookings: [response.data!, ...state.myBookings],
            }))
            // Reset selection
            get().resetSelection()
            return response.data
          }
          return null
        } catch (error) {
          console.error("[Booking] Create booking failed:", error)
          return null
        } finally {
          set({ isCreatingBooking: false })
        }
      },

      // Cancel booking
      cancelBooking: async (bookingId, reason) => {
        try {
          const response = await bookingService.bookings.cancel(bookingId, reason)
          if (response.success) {
            // Update booking status in state
            set((state) => ({
              myBookings: state.myBookings.map((b) =>
                b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
              ),
            }))
            return true
          }
          return false
        } catch (error) {
          console.error("[Booking] Cancel failed:", error)
          return false
        }
      },

      // Fetch user's bookings
      fetchMyBookings: async () => {
        set({ isLoading: true })
        try {
          const response = await bookingService.bookings.myBookings()
          if (response.success && response.data) {
            set({ myBookings: response.data })
          }
        } catch (error) {
          console.error("[Booking] Fetch my bookings failed:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Set user location for nearby search
      setUserLocation: (location) => {
        set({ userLocation: location })
      },

      // Reset selection
      resetSelection: () => {
        set({
          selectedSalon: null,
          services: [],
          selectedService: null,
          availableSlots: [],
          selectedDate: null,
          selectedSlot: null,
        })
      },
    }),
    { name: "BookingStore" },
  ),
)
