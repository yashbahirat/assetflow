"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface MaintenanceRequest {
  id: string;
  assetId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  description: string;
  createdAt: string;
  asset: { tag: string; name: string };
  user: { firstName: string; lastName: string };
}

type Columns = {
  [key in MaintenanceRequest['status']]: {
    id: string;
    title: string;
    icon: React.ReactNode;
    items: MaintenanceRequest[];
  };
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const [columns, setColumns] = useState<Columns>({
    PENDING: {
      id: 'PENDING',
      title: 'Pending',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      items: []
    },
    IN_PROGRESS: {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      items: []
    },
    RESOLVED: {
      id: 'RESOLVED',
      title: 'Resolved',
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      items: []
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/maintenance');
      const reqs: MaintenanceRequest[] = data.requests;
      
      const newCols = {
        PENDING: { ...columns.PENDING, items: reqs.filter(r => r.status === 'PENDING') },
        IN_PROGRESS: { ...columns.IN_PROGRESS, items: reqs.filter(r => r.status === 'IN_PROGRESS') },
        RESOLVED: { ...columns.RESOLVED, items: reqs.filter(r => r.status === 'RESOLVED') },
      };
      setColumns(newCols);
    } catch (err) {
      console.error('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = columns[source.droppableId as keyof Columns];
      const destCol = columns[destination.droppableId as keyof Columns];
      const sourceItems = [...sourceCol.items];
      const destItems = [...destCol.items];
      const [removed] = sourceItems.splice(source.index, 1);
      
      // Optimistic update
      const newStatus = destination.droppableId as MaintenanceRequest['status'];
      removed.status = newStatus;
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      });

      // API call
      try {
        await api.put(`/maintenance/${removed.id}/status`, { status: newStatus });
        // Re-fetch to ensure sync if needed, but optimistic update is usually fine
      } catch (err) {
        alert('Failed to update status');
        fetchRequests(); // revert on failure
      }
    }
  };

  if (loading) return null;

  if (user?.role !== 'ADMIN' && user?.role !== 'ASSET_MANAGER') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <h1 className="text-xl">Access Denied. You do not have permission to view the maintenance board.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Maintenance Board
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Drag and drop tickets to update their status.
            </p>
          </div>

          <div className="flex gap-6 h-[calc(100vh-200px)] overflow-x-auto pb-4">
            <DragDropContext onDragEnd={onDragEnd}>
              {Object.entries(columns).map(([columnId, column]) => (
                <div key={columnId} className="flex flex-col flex-shrink-0 w-80">
                  <div className="flex items-center gap-2 mb-4">
                    {column.icon}
                    <h2 className="font-semibold text-gray-700">{column.title}</h2>
                    <span className="ml-auto bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                      {column.items.length}
                    </span>
                  </div>
                  
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 rounded-xl p-3 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-indigo-50 border-indigo-200 border-2 border-dashed' : 'bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        {column.items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5 ${
                                  snapshot.isDragging ? 'shadow-lg ring-indigo-500' : 'hover:shadow-md'
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <Link href={`/assets/${item.assetId}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                    {item.asset.tag}
                                  </Link>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 mb-1">{item.asset.name}</h3>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{item.description}</p>
                                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                                  <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <span className="text-xs font-medium text-indigo-700">{item.user.firstName[0]}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    Reported by {item.user.firstName}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </DragDropContext>
          </div>
        </main>
      </div>
    </div>
  );
}
