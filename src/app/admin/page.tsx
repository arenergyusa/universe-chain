'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, Settings } from 'lucide-react';

interface ConfigItem {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminDashboard() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (res.ok) {
        setConfigs(data.configs);
      } else {
        toast.error(data.error || 'Failed to load configs');
      }
    } catch (err) {
      toast.error('An error occurred while loading configs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleUpdate = async (key: string, valueToUpdate: string, description?: string) => {
    setUpdating(key);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: valueToUpdate, description }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Config "${key}" updated successfully!`);
        // If it's a new key, append it, else update
        setConfigs(prev => {
          const exists = prev.find(c => c.key === key);
          if (exists) return prev.map(c => c.key === key ? data.config : c);
          return [...prev, data.config];
        });
        if (key === newKey) {
          setIsCreating(false);
          setNewKey('');
          setNewValue('');
          setNewDesc('');
        }
      } else {
        toast.error(data.error || 'Failed to update config');
      }
    } catch (err) {
      toast.error('An error occurred while updating config');
    } finally {
      setUpdating(null);
    }
  };

  const ConfigCard = ({ config }: { config: ConfigItem }) => {
    const [localValue, setLocalValue] = useState(config.value);
    const isChanged = localValue !== config.value;

    return (
      <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{config.key}</h3>
            {config.description && (
              <p className="text-xs text-slate-500">{config.description}</p>
            )}
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          />
          <button
            onClick={() => handleUpdate(config.key, localValue)}
            disabled={!isChanged || updating === config.key}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
          >
            {updating === config.key ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">System Variables</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm"
        >
          + Add New
        </button>
      </div>

      {isCreating && (
        <div className="glass-card bg-white border border-sky-200 rounded-3xl p-6 shadow-sm space-y-4 mb-6">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Create New Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="KEY_NAME"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />
            <input
              type="text"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCreating(false)}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold py-2 px-4 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUpdate(newKey, newValue, newDesc)}
              disabled={!newKey || !newValue || updating === newKey}
              className="bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center gap-2"
            >
              {updating === newKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Config
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.length > 0 ? (
          configs.map(config => (
            <ConfigCard key={config.id} config={config} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white border border-slate-200/60 rounded-3xl">
            <p className="text-sm font-bold text-slate-500">No system configurations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
