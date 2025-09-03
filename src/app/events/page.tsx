"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, ArrowRight, Search, Filter } from "lucide-react";
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
  organizer: {
    name: string;
  };
  _count: {
    orders: number;
  };
}

interface Filters {
  category: string;
  city: string;
  from: string;
  to: string;
  text: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    category: "",
    city: "",
    from: "",
    to: "",
    text: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ["Concert", "Conference", "Workshop", "Sports", "Theater", "Other"];

  useEffect(() => {
    fetchEvents();
  }, [filters, page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12"
      });

      if (filters.category) params.append("category", filters.category);
      if (filters.city) params.append("city", filters.city);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.text) params.append("text", filters.text);

      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();
      
      setEvents(data.events || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      city: "",
      from: "",
      to: "",
      text: ""
    });
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Discover Amazing Events</h1>
        <p className="text-xl text-muted-foreground">
          Find and book tickets for the best events in your area
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={filters.text}
              onChange={(e) => handleFilterChange("text", e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">From Date</label>
                  <Input
                    type="date"
                    value={filters.from}
                    onChange={(e) => handleFilterChange("from", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">To Date</label>
                  <Input
                    type="date"
                    value={filters.to}
                    onChange={(e) => handleFilterChange("to", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              No events found matching your criteria. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  
                  <div className="text-sm text-muted-foreground">
                    Organized by {event.organizer.name}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
