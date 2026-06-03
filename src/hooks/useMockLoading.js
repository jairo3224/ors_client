import { useState, useEffect } from 'react';

export default function useMockLoading(mockData, delay = 300) {
  const [data, setData] = useState(Array.isArray(mockData) ? [] : {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      await new Promise(r => setTimeout(r, delay));
      if (!cancelled) {
        setData(mockData);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return [data, setData, loading];
}
