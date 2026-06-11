import { useState, useEffect } from 'react';
import api from '../services/api';

// Cache for users and partners
let usersCache = null;
let partnersCache = null;

export function useLookups() {
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!usersCache) {
          const res = await api.get('/users?page=0&size=500').catch(() => ({ data: {} }));
          usersCache = Array.isArray(res.data.content) ? res.data.content : Array.isArray(res.data) ? res.data : [];
        }
        if (!partnersCache) {
          const res = await api.get('/partners?page=0&size=500').catch(() => ({ data: {} }));
          partnersCache = Array.isArray(res.data.content) ? res.data.content : Array.isArray(res.data) ? res.data : [];
        }
        setUsers(usersCache);
        setPartners(partnersCache);
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  const getUserName = (userId) => {
    const u = users.find(u => u.userId === userId);
    return u ? u.name : `User #${userId}`;
  };

  const getPartnerName = (partnerId) => {
    const p = partners.find(p => p.partnerId === partnerId);
    return p ? p.name : `Partner #${partnerId}`;
  };

  const invalidateCache = () => { usersCache = null; partnersCache = null; };

  return { users, partners, getUserName, getPartnerName, loading, invalidateCache };
}

