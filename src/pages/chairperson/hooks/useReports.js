import { useState, useEffect } from 'react';
import api from '../../../services/api';

export function useReports(deptId) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deptId) return;
    setLoading(true);
    api.get('/chairperson/reports')
      .then(res => {
        const reports = res?.data?.data?.reports || [];
        if (reports.length === 0) {
          // Try localhost-only debug endpoint
          return api.get('/debug/reports')
            .then(r => {
              const rep = r?.data?.data?.reports || [];
              const mapped = rep.map(x => ({
                id: x.id,
                student_id: x.student_id,
                student_name: x.student_name,
                teacher_name: x.teacher_name,
                subject: x.subject,
                type: x.type,
                severity: x.severity,
                description: x.description,
                date_submitted: x.date_submitted,
                status: x.status,
                remarks: x.remarks || [],
              }));
              setReports(mapped);
            })
            .catch(() => setReports([]));
        }

        const mapped = reports.map(r => ({
          id: r.id,
          student_id: r.student_id,
          student_name: r.student_name,
          teacher_name: r.teacher_name,
          subject: r.subject,
          type: r.type,
          severity: r.severity,
          description: r.description,
          date_submitted: r.date_submitted,
          status: r.status,
          remarks: r.remarks || [],
        }));
        setReports(mapped);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [deptId]);

  return { reports, setReports, loading };
}