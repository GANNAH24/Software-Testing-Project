import { useEffect, useState } from 'react';

export default function useHealth(baseUrl = 'http://localhost:3000') {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/health`);
        const json = await res.json();
        if (!cancelled) {
          setStatus(res.ok ? 'ok' : 'error');
          setMessage(json.message || '');
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setMessage(e.message);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [baseUrl]);
  return { status, message };
}