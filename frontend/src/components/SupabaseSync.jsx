import React, { useState, useEffect } from 'react';

const SupabaseSync = ({ activeWorkout }) => {
  const [status, setStatus] = useState({ checking: true, connected: false, message: '', url: '' });
  const [saveStatus, setSaveStatus] = useState({ saving: false, message: '', error: null, missingTable: false });
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  useEffect(() => {
    async function checkConn() {
      try {
        const res = await fetch('/api/supabase/status');
        const data = await res.json();
        setStatus({
          checking: false,
          connected: Boolean(data.connected),
          message: data.message || (data.connected ? 'Connected to your existing Supabase project' : 'Not connected'),
          url: data.url || '',
          tables: data.availableTables || []
        });
      } catch (err) {
        setStatus({
          checking: false,
          connected: false,
          message: 'Unable to query Supabase status: ' + err.message,
          url: ''
        });
      }
    }

    checkConn();
  }, []);

  const handleSaveWorkout = async () => {
    if (!activeWorkout) return;
    setSaveStatus({ saving: true, message: 'Saving workout to Supabase...', error: null, missingTable: false });

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activeWorkout)
      });

      let result = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned HTTP ${response.status} (${response.statusText || 'Non-JSON'})`);
      }

      if (!response.ok) {
        if (result.table_missing) {
          setSaveStatus({
            saving: false,
            message: "Table 'public.workouts' does not exist in your Supabase project yet.",
            error: true,
            missingTable: true
          });
          setShowSqlHelp(true);
        } else {
          setSaveStatus({
            saving: false,
            message: result.error || 'Failed to save workout to Supabase',
            error: true,
            missingTable: false
          });
        }
        return;
      }

      setSaveStatus({
        saving: false,
        message: 'Workout successfully stored in your Supabase database!',
        error: false,
        missingTable: false
      });
    } catch (err) {
      setSaveStatus({
        saving: false,
        message: 'Error saving to Supabase: ' + err.message,
        error: true,
        missingTable: false
      });
    }
  };

  return (
    <div className="supabase-sync-card">
      <div className="sync-header">
        <div className="sync-title-box">
          <span className="sync-icon">⚡</span>
          <div>
            <h4 className="sync-title">Supabase Database Integration</h4>
            <p className="sync-subtitle">
              {status.checking 
                ? 'Verifying Supabase connection...'
                : status.connected 
                  ? `Connected: ${status.url}`
                  : status.message}
            </p>
          </div>
        </div>

        <div className="sync-status-badge-wrapper">
          {status.connected ? (
            <span className="badge-connected">
              <span className="dot-green"></span> Supabase Connected
            </span>
          ) : (
            <span className="badge-unconfigured">
              <span className="dot-amber"></span> Awaiting Credentials
            </span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="sync-actions-row">
        <div className="sync-meta-info">
          <span>Project Ref: <strong>rftvldfiegdvomhacsii</strong></span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>Status: <strong>Active</strong></span>
        </div>

        {activeWorkout && (
          <button 
            className="btn-save-workout" 
            onClick={handleSaveWorkout}
            disabled={saveStatus.saving}
          >
            {saveStatus.saving ? 'Saving...' : '💾 Save Current Plan to Supabase'}
          </button>
        )}
      </div>

      {/* Save Status Banner */}
      {saveStatus.message && (
        <div className={`save-status-banner ${saveStatus.error ? 'is-error' : 'is-success'}`}>
          <span>{saveStatus.error ? '⚠️' : '✅'}</span>
          <span>{saveStatus.message}</span>
          {saveStatus.missingTable && (
            <button 
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#991B1B', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setShowSqlHelp(!showSqlHelp)}
            >
              {showSqlHelp ? 'Hide SQL' : 'View SQL to Create Table'}
            </button>
          )}
        </div>
      )}

      {/* Optional SQL Table Creation Helper */}
      {showSqlHelp && (
        <div style={{ background: '#0F172A', color: '#F1F5F9', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          <p style={{ color: '#34D399', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            To store workouts in Supabase, run this in your Supabase SQL Editor:
          </p>
          <pre style={{ overflowX: 'auto', background: '#1E293B', padding: '0.75rem', borderRadius: '6px' }}>
{`CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  time_minutes INTEGER NOT NULL,
  rounds INTEGER NOT NULL,
  rest_period TEXT,
  experience TEXT,
  exercises JSONB,
  trainer_tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SupabaseSync;
