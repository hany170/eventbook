"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
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
}

export function FeaturedEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events?limit=3');
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground">
            No events available at the moment. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 bg-muted">
            {event.coverImageUrl ? (
              <Image
                src={event.coverImageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-primary opacity-50" />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-background border px-2 py-1 rounded text-sm font-medium">
              ${(event.priceCents / 100).toFixed(2)}
            </div>
          </div>
          
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-primary mb-2">
              <span className="bg-primary/10 px-2 py-1 rounded-full">
                {event.category}
              </span>
            </div>
            <CardTitle className="line-clamp-2">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description || "Join us for an amazing event!"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.startAt).toLocaleDateString()}</span>
            </div>
            
            {event.venueName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.venueName}</span>
                {event.venueCity && <span>, {event.venueCity}</span>}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Capacity: {event.capacity}</span>
            </div>
            
            <Link href={`/events/${event.id}`}>
              <Button className="w-full">
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
