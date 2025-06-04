'use client';

import { useState } from 'react';
import { format, isSameMonth, parseISO, startOfMonth, 
  endOfMonth, eachDayOfInterval, isSameDay, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockEvents } from '@/lib/data/mock-data';

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Get events for the selected date
  const selectedDateEvents = mockEvents.filter((event) => {
    const eventDate = parseISO(event.start);
    return isSameDay(eventDate, date);
  });
  
  // Get days with events for the calendar
  const daysWithEvents = mockEvents.map((event) => parseISO(event.start));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <Button className="gap-2">
          <span>Add Event</span>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
              classNames={{
                day_today: "bg-primary text-primary-foreground font-bold",
              }}
              components={{
                DayContent: ({ day }) => {
                  if (!day || !isValid(day)) return null;
                  
                  const hasEvent = daysWithEvents.some((eventDay) => 
                    eventDay && isValid(eventDay) && isSameDay(eventDay, day)
                  );
                  
                  return (
                    <div className="relative h-full w-full p-2 flex items-center justify-center">
                      <span>{format(day, 'd')}</span>
                      {hasEvent && (
                        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              {format(date, 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => {
                  const startTime = parseISO(event.start);
                  const endTime = parseISO(event.end);
                  
                  if (!isValid(startTime) || !isValid(endTime)) return null;
                  
                  return (
                    <div key={event.id} className="border p-3 rounded-md">
                      <h4 className="font-medium">{event.title}</h4>
                      {!event.allDay && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                        </p>
                      )}
                      {event.allDay && (
                        <Badge variant="outline" className="mt-1">All day</Badge>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 border rounded-md">
                <p className="text-muted-foreground text-sm">No events for this day</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}