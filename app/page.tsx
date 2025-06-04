import { DashboardTaskList } from '@/components/dashboard/task-list';
import { DashboardStats } from '@/components/dashboard/stats';
import { DashboardCalendar } from '@/components/dashboard/calendar';
import { DashboardNotes } from '@/components/dashboard/notes';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-6">
          <DashboardTaskList />
          <DashboardNotes />
        </div>
        <DashboardCalendar />
      </div>
    </div>
  );
}