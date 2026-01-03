import { Suspense } from 'react'
import { EventCalendar } from '@/components/EventCalendar'

export const metadata = {
  title: 'Events | The 500 Companion',
  description: 'Upcoming events at The 500',
}

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Events</h1>
      <Suspense fallback={<EventsCalendarSkeleton />}>
        <EventCalendar />
      </Suspense>
    </div>
  )
}

function EventsCalendarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
