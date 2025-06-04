import { Card } from "@/components/ui/card"
import { DashboardNotes } from "@/components/dashboard/notes"

export default function NotesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground mt-2">
          Manage and organize your notes effectively.
        </p>
      </div>
      
      <Card className="p-6">
        <DashboardNotes />
      </Card>
    </div>
  )
}