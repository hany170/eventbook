"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, CreditCard, Loader2 } from "lucide-react";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  venueName?: string;
  venueCity?: string;
  coverImageUrl?: string;
  priceCents: number;
  capacity: number;
  category: string;
  availableGA: number;
  hasSeating: boolean;
  seats: Array<{
    id: string;
    label: string;
    section: string;
    priceCents?: number;
    status?: string;
  }>;
}

export default function CheckoutPage({ params }: { params: { eventId: string } }) {
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState<"GA" | "SEATED">("GA");
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/checkout/${params.eventId}`);
      return;
    }

    fetchEvent();
  }, [status, params.eventId, router]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        router.push("/events");
      }
    } catch (error) {
      console.error("Failed to fetch event:", error);
      router.push("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelection = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const calculateTotal = () => {
    if (!event) return 0;
    
    if (bookingType === "GA") {
      return event.priceCents * quantity;
    } else {
      return selectedSeats.reduce((total, seatId) => {
        const seat = event.seats.find(s => s.id === seatId);
        return total + (seat?.priceCents || event.priceCents);
      }, 0);
    }
  };

  const handleCheckout = async () => {
    if (!event) return;

    // Clear any previous errors
    setError(null);
    setProcessing(true);

    try {
      // Validate booking requirements
      if (bookingType === "SEATED" && selectedSeats.length === 0) {
        setError("Please select at least one seat");
        setProcessing(false);
        return;
      }

      if (bookingType === "GA" && quantity < 1) {
        setError("Please select at least one ticket");
        setProcessing(false);
        return;
      }

      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          type: bookingType,
          qty: bookingType === "GA" ? quantity : undefined,
          seatIds: bookingType === "SEATED" ? selectedSeats : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("An error occurred during checkout. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/events")}>
          Browse Events
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Book Your Tickets</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Complete your booking for {event.title}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {event.coverImageUrl ? (
                <Image
                  src={event.coverImageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {event.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.startAt).toLocaleDateString()}</span>
                </div>
                
                {event.venueName && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venueName}</span>
                    {event.venueCity && <span>, {event.venueCity}</span>}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>Category: {event.category}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Select Tickets</CardTitle>
            <CardDescription>
              Choose your ticket type and quantity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Ticket Type</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={bookingType === "GA" ? "default" : "outline"}
                  onClick={() => setBookingType("GA")}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Users className="h-5 w-5" />
                  <span>General Admission</span>
                  <span className="text-sm opacity-75">
                    ${(event.priceCents / 100).toFixed(2)} each
                  </span>
                </Button>
                
                <Button
                  variant={bookingType === "SEATED" ? "default" : "outline"}
                  onClick={() => setBookingType("SEATED")}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  disabled={!event.hasSeating}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Seated</span>
                  <span className="text-sm opacity-75">
                    Select seats
                  </span>
                </Button>
              </div>
            </div>

            {/* Quantity Selection (GA) */}
            {bookingType === "GA" && (
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={event.availableGA}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(event.availableGA, quantity + 1))}
                    disabled={quantity >= event.availableGA}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {event.availableGA - quantity} tickets remaining
                </p>
              </div>
            )}

            {/* Seat Selection (Seated) */}
            {bookingType === "SEATED" && event.hasSeating && (
              <div>
                <label className="block text-sm font-medium mb-3">Select Seats</label>
                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-3 border rounded-lg">
                  {event.seats.map((seat) => (
                    <Button
                      key={seat.id}
                      variant={selectedSeats.includes(seat.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSeatSelection(seat.id)}
                      className="h-10 text-xs"
                      disabled={seat.status !== "AVAILABLE"}
                    >
                      {seat.label}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedSeats.length} seats selected
                </p>
              </div>
            )}

            {/* Price Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Subtotal:</span>
                <span>${(calculateTotal() / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${(calculateTotal() / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={processing || (bookingType === "SEATED" && selectedSeats.length === 0)}
              className="w-full h-12 text-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              You will be redirected to Stripe to complete your payment securely
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
