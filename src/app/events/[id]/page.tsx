"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  venueName?: string;
  venueCity?: string;
  coverImageUrl?: string;
  priceCents: number;
  capacity: number;
  category: string;
  availableGA: number;
  hasSeating: boolean;
  organizer: {
    name: string;
    email: string;
  };
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden">
        {event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
            <Calendar className="h-32 w-32 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end p-8">
          <div className="text-white">
            <div className="mb-4">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                {event.category}
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
            <div className="flex items-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(event.startAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{formatTime(event.startAt)} - {formatTime(event.endAt)}</span>
              </div>
              {event.venueName && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.venueName}</span>
                  {event.venueCity && <span>, {event.venueCity}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {event.description || "No description available for this event."}
              </p>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(event.startAt)}<br />
                      {formatTime(event.startAt)} - {formatTime(event.endAt)}
                    </p>
                  </div>
                </div>

                {event.venueName && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.venueName}
                        {event.venueCity && <br />}
                        {event.venueCity}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.capacity.toLocaleString()} people
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round((new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) / (1000 * 60 * 60))} hours
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer */}
          <Card>
            <CardHeader>
              <CardTitle>Organized By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{event.organizer.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{event.organizer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Book Tickets</CardTitle>
              <CardDescription>
                Secure your spot at this amazing event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${(event.priceCents / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">per ticket</p>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>General Admission:</span>
                  <span className="font-medium">{event.availableGA} available</span>
                </div>
                {event.hasSeating && (
                  <div className="flex justify-between text-sm">
                    <span>Seated Options:</span>
                    <span className="font-medium">Available</span>
                  </div>
                )}
              </div>

              {/* Booking Button */}
              {session ? (
                <Link href={`/checkout/${event.id}`}>
                  <Button className="w-full h-12 text-lg">
                    Book Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/auth/signin?callbackUrl=/events/${event.id}`}>
                  <Button className="w-full h-12 text-lg">
                    Sign In to Book
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Quick Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Secure payment via Stripe</p>
                <p>• Instant digital tickets</p>
                <p>• QR code validation</p>
                {event.hasSeating && <p>• Interactive seat selection</p>}
              </div>
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle>Share Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
