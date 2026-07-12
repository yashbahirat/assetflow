import { AlertCircle } from "lucide-react";

const overdueAssets = [
  { id: 1, tag: "MBP-2023-014", category: "Laptops", user: "Alex Mercer", expectedReturn: "2026-07-01", daysOverdue: 11 },
  { id: 2, tag: "CAM-SONY-002", category: "Cameras", user: "Sarah Connor", expectedReturn: "2026-07-08", daysOverdue: 4 },
  { id: 3, tag: "PROJ-EPS-005", category: "Projectors", user: "Michael Scott", expectedReturn: "2026-07-10", daysOverdue: 2 },
];

export function OverdueList() {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Overdue Returns
        </h2>
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
          {overdueAssets.length} items
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue By</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {overdueAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.tag}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.user}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.expectedReturn}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    {asset.daysOverdue} days
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">Notify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
