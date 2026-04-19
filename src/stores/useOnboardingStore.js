import { create } from 'zustand'

const useOnboardingStore = create((set, get) => ({
  currentStep: 1,
  draftData: {
    propertyType: null,
    location: {},
    basics: { guests: 1, bedrooms: 1, beds: 1, bathrooms: 1 },
    amenities: [],
    standoutAmenities: [],
    photos: [],
    title: '',
    highlights: [],
    description: '',
    bookingSettings: {
      instantBook: false,
      petsAllowed: false,
      selfCheckIn: false,
      eventsAllowed: false,
    },
    pricing: { weekday: '', weekend: '' },
  },

  setStep: (step) => set({ currentStep: step }),

  updateDraft: (key, value) =>
    set((state) => ({
      draftData: { ...state.draftData, [key]: value },
    })),

  updateBasics: (key, value) =>
    set((state) => ({
      draftData: {
        ...state.draftData,
        basics: { ...state.draftData.basics, [key]: value },
      },
    })),

  updateBookingSettings: (key, value) =>
    set((state) => ({
      draftData: {
        ...state.draftData,
        bookingSettings: { ...state.draftData.bookingSettings, [key]: value },
      },
    })),

  updatePricing: (key, value) =>
    set((state) => ({
      draftData: {
        ...state.draftData,
        pricing: { ...state.draftData.pricing, [key]: value },
      },
    })),

  resetDraft: () =>
    set({
      currentStep: 1,
      draftData: {
        propertyType: null,
        location: {},
        basics: { guests: 1, bedrooms: 1, beds: 1, bathrooms: 1 },
        amenities: [],
        standoutAmenities: [],
        photos: [],
        title: '',
        highlights: [],
        description: '',
        bookingSettings: {
          instantBook: false,
          petsAllowed: false,
          selfCheckIn: false,
          eventsAllowed: false,
        },
        pricing: { weekday: '', weekend: '' },
      },
    }),
}))

export default useOnboardingStore
