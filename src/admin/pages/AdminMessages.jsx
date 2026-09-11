import React, { useEffect, useState } from 'react';
import { MessageSquare, Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminMessages() {
  const { messages, refreshMessages, updateMessageStatus } = useStoreData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshMessages().finally(() => setLoading(false));
  }, [refreshMessages]);

  const handleMarkRead = async (id) => {
    const result = await updateMessageStatus(id, 'Read');
    if (!result.success) window.alert(`Could not update message: ${result.message || 'Unknown error'}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Customer Messages ({messages.length})</h2>
        <p className="text-xs text-gray-500 mt-0.5">Inquiries submitted via the Contact page</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 font-serif text-sm">
            No messages yet.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-3xl border p-5 shadow-2xs space-y-3 ${
                m.status === 'New' ? 'border-[#6B1518]/30 ring-1 ring-[#6B1518]/10' : 'border-gray-100'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#6B1518]" />
                  <span className="font-bold text-sm text-gray-900">{m.name}</span>
                  {m.status === 'New' && (
                    <span className="bg-[#F8F0F0] text-[#6B1518] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">New</span>
                  )}
                </div>
                <span className="text-[11px] text-gray-400">
                  {m.createdAt ? new Date(m.createdAt).toLocaleString('en-IN') : ''}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {m.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {m.phone}</span>
                )}
                {m.email && (
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {m.email}</span>
                )}
              </div>

              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                {m.message}
              </p>

              {m.status === 'New' && (
                <button
                  onClick={() => handleMarkRead(m.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
