'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'

export function EventCalendar() {
  const router = useRouter()

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          prev: 'Previous',
          next: 'Next',
        }}
        buttonHints={{
          prev: 'Previous month',
          next: 'Next month',
          today: 'Go to today',
          dayGridMonth: 'Month view',
          listWeek: 'Week list view',
        }}
        events="/api/events/feed"
        eventClick={(info) => {
          info.jsEvent.preventDefault()
          if (info.event.url) {
            router.push(info.event.url)
          }
        }}
        height="auto"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        eventDisplay="block"
        eventClassNames="cursor-pointer"
        dayMaxEvents={3}
        moreLinkClick="popover"
        nowIndicator={true}
        // Mobile-friendly settings
        views={{
          dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'long' },
          },
          listWeek: {
            titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
          },
        }}
      />
    </div>
  )
}
