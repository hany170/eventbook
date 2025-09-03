"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Settings, Plus, Eye, Edit, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  published: boolean;
  _count: {
    orders: number;
  };
}

interface Order {
  id: string;
  qty: number;
  amountTotalCents: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    title: string;
    startAt: string;
    venueName: string;
  };
  tickets: Array<{
    id: string;
    serialNo: string;
    seat?: {
      label: string;
      section: string;
    };
  }>;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"events" | "orders">("events");
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchData();
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [eventsResponse, ordersResponse] = await Promise.all([
        fetch("/api/events?limit=50"),
        fetch("/api/admin/orders")
      ]);

      const eventsData = await eventsResponse.json();
      const ordersData = await ordersResponse.json();

      setEvents(eventsData.events || []);
      setOrders(ordersData.orders || []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEventPublish = async (eventId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId 
              ? { ...event, published: !currentStatus }
              : event
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle event publish status:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage events, orders, and system settings
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {events.filter(e => e.published).length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {orders.filter(o => o.status === "PAID").length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(orders
                .filter(o => o.status === "PAID")
                .reduce((sum, o) => sum + o.amountTotalCents, 0) / 100
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders
                .filter(o => o.status === "PAID")
                .reduce((sum, o) => sum + o.qty, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Issued tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("events")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "events"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "orders"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Orders ({orders.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Events Management</h2>
          </div>

          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }`}>
                        {event.published ? "Published" : "Draft"}
                      </span>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                        {event.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {event.description || "No description provided"}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.startAt).toLocaleDateString()}
                      </div>
                      {event.venueName && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venueName}
                          {event.venueCity && `, ${event.venueCity}`}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event._count.orders} orders
                      </div>
                      <div className="font-medium">
                        ${(event.priceCents / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleEventPublish(event.id, event.published)}
                    >
                      {event.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/events/${event.id}/sections`}>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Orders Overview</h2>
          </div>

          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">Order #{order.id.slice(-8)}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "PAID"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="font-medium">{order.user.name} ({order.user.email})</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Event</p>
                        <p className="font-medium">{order.event.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.event.startAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {order.event.venueName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {order.qty} tickets
                      </div>
                      <div className="font-medium">
                        ${(order.amountTotalCents / 100).toFixed(2)}
                      </div>
                    </div>
                    
                    {order.tickets.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Tickets:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.tickets.map((ticket) => (
                            <span key={ticket.id} className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                              {ticket.serialNo}
                              {ticket.seat && ` (${ticket.seat.label})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
