'use client';

import { useState, useEffect } from 'react';
import { format, isSameMonth, parseISO, startOfMonth, 
  endOfMonth, eachDayOfInterval, isSameDay, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { db } from '@/lib/db';
import { Event } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function DashboardCalendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    allDay: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const events = await db.getEvents();
      setEvents(events);
    } catch (error) {
      toast({
        title: 'Error loading events',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Get events for the selected date
  const selectedDateEvents = events.filter((event) => {
    const eventDate = parseISO(event.start);
    return isValid(eventDate) && isSameDay(eventDate, date);
  });

  // Get days with events for the calendar
  const daysWithEvents = events
    .map((event) => parseISO(event.start))
    .filter((date) => isValid(date));

  const handleCreateOrUpdateEvent = async () => {
    try {
      if (!eventForm.title.trim()) {
        toast({
          title: 'Title is required',
          variant: 'destructive',
        });
        return;
      }

      const event: Event = {
        id: selectedEvent?.id || crypto.randomUUID(),
        title: eventForm.title,
        description: eventForm.description,
        start: eventForm.start,
        end: eventForm.end,
        allDay: eventForm.allDay,
      };

      if (selectedEvent) {
        await db.updateEvent(event);
        setEvents(events.map(e => e.id === event.id ? event : e));
        toast({
          title: 'Event updated successfully',
        });
      } else {
        await db.createEvent(event);
        setEvents([...events, event]);
        toast({
          title: 'Event created successfully',
        });
      }

      setEventForm({
        title: '',
        description: '',
        start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        allDay: false,
      });
      setSelectedEvent(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: `Error ${selectedEvent ? 'updating' : 'creating'} event`,
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      start: event.start,
      end: event.end,
      allDay: event.allDay,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await db.deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: 'Event deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error deleting event',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setSelectedEvent(null);
      setEventForm({
        title: '',
        description: '',
        start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        allDay: false,
      });
    }
    setIsDialogOpen(open);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Calendar</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedEvent ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Event title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Description (optional)"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="all-day"
                    checked={eventForm.allDay}
                    onCheckedChange={(checked) => setEventForm({ ...eventForm, allDay: checked })}
                  />
                  <Label htmlFor="all-day">All day event</Label>
                </div>
                {!eventForm.allDay && (
                  <>
                    <div className="space-y-2">
                      <Label>Start</Label>
                      <Input
                        type="datetime-local"
                        value={eventForm.start}
                        onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End</Label>
                      <Input
                        type="datetime-local"
                        value={eventForm.end}
                        onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <Button onClick={handleCreateOrUpdateEvent} className="w-full">
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Your upcoming events</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
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
              if (!isValid(day)) return null;
              
              const hasEvent = daysWithEvents.some((eventDay) => 
                isValid(eventDay) && isSameDay(eventDay, day)
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
        
        <div className="mt-4 flex-1">
          <h3 className="font-medium text-sm mb-3">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h3>
          
          {selectedDateEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => {
                const startTime = parseISO(event.start);
                const endTime = parseISO(event.end);
                
                if (!isValid(startTime) || !isValid(endTime)) return null;
                
                return (
                  <div key={event.id} className="group border p-3 rounded-md">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
        </div>
      </CardContent>
    </Card>
  );
}