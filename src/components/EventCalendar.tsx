'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function EventCalendar() {
  const router = useRouter()
  const [viewportChecked, setViewportChecked] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    setViewportChecked(true)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Don't render calendar until we know the viewport size
  if (!viewportChecked) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
        headerToolbar={
          isMobile
            ? { left: 'prev,next', center: 'title', right: 'dayGridMonth,listWeek' }
            : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek' }
        }
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
