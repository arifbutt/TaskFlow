'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Pin, Plus, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/db';
import { Note } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function DashboardNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    color: '#ffcca5',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const notes = await db.getNotes();
      setNotes(notes);
    } catch (error) {
      toast({
        title: 'Error loading notes',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const togglePin = async (noteId: string) => {
    try {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      const updatedNote = {
        ...note,
        isPinned: !note.isPinned,
        updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
      };

      await db.updateNote(updatedNote);
      setNotes(notes.map((n) => (n.id === noteId ? updatedNote : n)));
    } catch (error) {
      toast({
        title: 'Error updating note',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleCreateOrUpdateNote = async () => {
    try {
      if (!noteForm.title.trim() || !noteForm.content.trim()) {
        toast({
          title: 'Title and content are required',
          variant: 'destructive',
        });
        return;
      }

      const note: Note = {
        id: selectedNote?.id || crypto.randomUUID(),
        title: noteForm.title,
        content: noteForm.content,
        color: noteForm.color,
        tags: selectedNote?.tags || [],
        isPinned: selectedNote?.isPinned || false,
        createdAt: selectedNote?.createdAt || format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
      };

      if (selectedNote) {
        await db.updateNote(note);
        setNotes(notes.map(n => n.id === note.id ? note : n));
        toast({
          title: 'Note updated successfully',
        });
      } else {
        await db.createNote(note);
        setNotes([...notes, note]);
        toast({
          title: 'Note created successfully',
        });
      }

      setNoteForm({ title: '', content: '', color: '#ffcca5' });
      setSelectedNote(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: `Error ${selectedNote ? 'updating' : 'creating'} note`,
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      color: note.color || '#ffcca5',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await db.deleteNote(noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      toast({
        title: 'Note deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error deleting note',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setSelectedNote(null);
      setNoteForm({ title: '', content: '', color: '#ffcca5' });
    }
    setIsDialogOpen(open);
  };

  // Sort notes: pinned first, then by update date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Display only first 3 notes for the dashboard
  const displayNotes = sortedNotes.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Notes</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedNote ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Note title"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Note content"
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="color"
                    value={noteForm.color}
                    onChange={(e) => setNoteForm({ ...noteForm, color: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateOrUpdateNote} className="w-full">
                  {selectedNote ? 'Update Note' : 'Create Note'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Recent and pinned notes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {displayNotes.map((note) => (
            <div 
              key={note.id} 
              className="group relative p-4 rounded-md border"
              style={{ backgroundColor: note.color ? `${note.color}20` : undefined }}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium line-clamp-1">{note.title}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEditNote(note)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => togglePin(note.id)}
                  >
                    <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-foreground' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
              </div>
              <div className="mt-3 flex items-center text-xs text-muted-foreground">
                <span>
                  {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                </span>
                {note.tags.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {displayNotes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No notes yet. Create your first note!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}