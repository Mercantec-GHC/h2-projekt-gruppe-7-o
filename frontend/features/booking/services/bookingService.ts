export const bookingService = {
  // Step 1: Search for available rooms

  // Step 2: Get details for a specific room type

  // Step 3: Create a reservation

  // Get user's bookings
  async getUserBookings(): Promise<BookingReservation[]> {
    const response = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get user bookings");
    }

    return response.json();
  },

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to cancel booking");
    }
  },
};
