"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ValidationResult {
  ok: boolean;
  message: string;
  code?: string;
  ticket?: {
    eventTitle: string;
    seatLabel?: string;
    scannedAt: string;
  };
}

export default function ValidatorPage() {
  const { data: session, status } = useSession();
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (session?.user?.role !== "VALIDATOR" && session?.user?.role !== "ADMIN") {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          You don't have permission to access this page.
        </p>
        <Button onClick={() => router.push("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: ticketCode.trim() }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.ok) {
        setTicketCode(""); // Clear input on success
      }
    } catch (error) {
      setResult({
        ok: false,
        message: "An error occurred while validating the ticket.",
        code: "ERROR"
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    
    if (result.ok) {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    }
    
    switch (result.code) {
      case "ALREADY_SCANNED":
        return <AlertCircle className="h-16 w-16 text-orange-500" />;
      case "INVALID_TICKET":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "EVENT_NOT_ACTIVE":
        return <AlertCircle className="h-16 w-16 text-yellow-500" />;
      default:
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getResultColor = () => {
    if (!result) return "";
    
    if (result.ok) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400";
    
    switch (result.code) {
      case "ALREADY_SCANNED":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400";
      case "INVALID_TICKET":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400";
      case "EVENT_NOT_ACTIVE":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Ticket Validator</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Scan or enter ticket codes to validate entry
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            Validate Ticket
          </CardTitle>
          <CardDescription>
            Enter the ticket code or scan the QR code to validate entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleValidation} className="space-y-4">
            <div>
              <label htmlFor="ticketCode" className="block text-sm font-medium mb-2">
                Ticket Code
              </label>
              <Input
                id="ticketCode"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Enter ticket code or scan QR code"
                className="font-mono"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate Ticket"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {result && (
        <Card className={getResultColor()}>
          <CardContent className="pt-6 text-center">
            {getResultIcon()}
            <h3 className="text-xl font-semibold mt-4 mb-2">
              {result.ok ? "Ticket Valid!" : "Validation Failed"}
            </h3>
            <p className="text-lg mb-4">{result.message}</p>
            
            {result.ticket && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left">
                <h4 className="font-semibold mb-2">Ticket Details:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Event:</strong> {result.ticket.eventTitle}</p>
                  {result.ticket.seatLabel && (
                    <p><strong>Seat:</strong> {result.ticket.seatLabel}</p>
                  )}
                  <p><strong>Scanned:</strong> {new Date(result.ticket.scannedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {result.code === "ALREADY_SCANNED" && result.ticket && (
              <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> This ticket was previously scanned on{" "}
                  {new Date(result.ticket.scannedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
              1
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask the attendee to show their ticket QR code or provide the ticket code
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
              2
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the code manually or scan the QR code with your device
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
              3
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click "Validate Ticket" to check if the ticket is valid and mark it as used
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
