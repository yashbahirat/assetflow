import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { OverdueList } from "@/components/dashboard/OverdueList";
import { Package, Users, Wrench } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <KpiCard
                title="Total Assets"
                value="2,845"
                icon={Package}
                trend="+4.75%"
                trendUp={true}
              />
              <KpiCard
                title="Allocated Assets"
                value="1,920"
                icon={Users}
                trend="+1.2%"
                trendUp={true}
              />
              <KpiCard
                title="In Maintenance"
                value="42"
                icon={Wrench}
                trend="-5"
                trendUp={false}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <OverdueList />
              </div>
              <div className="space-y-6">
                <div className="rounded-xl border bg-white p-6 shadow-sm h-[400px] flex items-center justify-center">
                  <span className="text-gray-500 font-medium">Activity Chart (Placeholder)</span>
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
