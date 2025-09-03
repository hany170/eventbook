"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, Download, Copy, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface TicketData {
  id: string;
  serialNo: string;
  code: string;
  qrJws: string;
  barcodeDataUrl?: string;
  issuedAt: string;
  validatedAt?: string;
  event: {
    title: string;
    startAt: string;
    endAt: string;
    venueName?: string;
    venueCity?: string;
    coverImageUrl?: string;
  };
  seat?: {
    label: string;
    section: string;
  };
}

export default function WalletPage() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchTickets();
      
      // Check if user was redirected from successful payment
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        setShowSuccessMessage(true);
        // Remove the success parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    }
  }, [status, router]);

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/wallet");
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, ticketId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(ticketId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const downloadQR = (qrDataUrl: string, eventTitle: string) => {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${eventTitle}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">My Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your tickets...
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold mb-4">No Tickets Yet</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          You haven't purchased any tickets yet. Start exploring events to get your first ticket!
        </p>
        <Button onClick={() => router.push("/events")}>
          Browse Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">My Tickets</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your digital tickets for upcoming events
        </p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Payment successful! Your tickets have been added to your wallet.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
              {ticket.event.coverImageUrl ? (
                <Image
                  src={ticket.event.coverImageUrl}
                  alt={ticket.event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <Ticket className="h-16 w-16 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                {ticket.validatedAt ? (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Used
                  </span>
                ) : (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Valid
                  </span>
                )}
              </div>

              {/* Serial Number */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                #{ticket.serialNo}
              </div>
            </div>

            <CardHeader>
              <CardTitle className="line-clamp-2">{ticket.event.title}</CardTitle>
              <CardDescription>
                {ticket.seat ? (
                  <span className="text-blue-600 dark:text-blue-400">
                    Seat {ticket.seat.label} in {ticket.seat.section}
                  </span>
                ) : (
                  "General Admission"
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(ticket.event.startAt).toLocaleDateString()}</span>
                </div>
                
                {ticket.event.venueName && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{ticket.event.venueName}</span>
                    {ticket.event.venueCity && <span>, {ticket.event.venueCity}</span>}
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="inline-block p-2 bg-white rounded-lg">
                  <Image
                    src={ticket.qrJws}
                    alt="QR Code"
                    width={120}
                    height={120}
                    className="rounded"
                  />
                </div>
                <div className="mt-2 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQR(ticket.qrJws, ticket.event.title)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download QR
                  </Button>
                </div>
              </div>

              {/* Ticket Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Ticket Code</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={ticket.code}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(ticket.code, ticket.id)}
                  >
                    {copiedCode === ticket.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {ticket.validatedAt && (
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This ticket was used on {new Date(ticket.validatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
