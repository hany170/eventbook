import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, ArrowRight, Ticket } from "lucide-react";
import Link from "next/link";
import { FeaturedEvents } from "@/components/featured-events";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Book Your Next
            <span className="text-primary"> Adventure</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover and book tickets for the best concerts, conferences, and workshops. 
            Your next unforgettable experience is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="text-lg px-8 py-4">
                Browse Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Easy Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Book tickets in seconds with our streamlined checkout process. 
              Choose between general admission or select your perfect seat.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Ticket className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Digital Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get instant digital tickets with QR codes and barcodes. 
              No more lost paper tickets or waiting in line.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <CardTitle>Secure & Reliable</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Built with enterprise-grade security. Your data and payments 
              are protected with industry-standard encryption.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* Featured Events */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">Featured Events</h2>
          <Link href="/events">
            <Button variant="outline">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <Suspense fallback={
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
        }>
          <FeaturedEvents />
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of event-goers who trust EventBook for their ticket needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Create Account
            </Button>
          </Link>
          <Link href="/events">
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
              Explore Events
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
