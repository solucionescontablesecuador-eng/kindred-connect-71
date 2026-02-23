// Motor de base de datos local usando localStorage
const STORAGE_KEY = "condominios_local_db";

const getInitialData = () => ({
  buildings: [],
  apartments: [],
  payments: [],
  profiles: []
});

export const getLocalData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return getInitialData();
  try {
    return JSON.parse(data);
  } catch (e) {
    return getInitialData();
  }
};

export const saveLocalData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const db = {
  getAll: (table: string) => {
    const data = getLocalData();
    return data[table] || [];
  },
  
  insert: (table: string, item: any) => {
    const data = getLocalData();
    if (!data[table]) data[table] = [];
    
    const newItem = { 
      ...item, 
      id: item.id || crypto.randomUUID(), 
      created_at: new Date().toISOString() 
    };
    
    data[table].push(newItem);
    saveLocalData(data);
    return newItem;
  },
  
  update: (table: string, id: string, updates: any) => {
    const data = getLocalData();
    if (!data[table]) return null;
    
    let updatedItem = null;
    data[table] = data[table].map((item: any) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates, updated_at: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });
    
    saveLocalData(data);
    return updatedItem;
  },
  
  delete: (table: string, id: string) => {
    const data = getLocalData();
    if (!data[table]) return;
    data[table] = data[table].filter((item: any) => item.id !== id);
    saveLocalData(data);
  },

  upsert: (table: string, item: any, conflictKey: string) => {
    const data = getLocalData();
    if (!data[table]) data[table] = [];
    
    const existingIndex = data[table].findIndex((i: any) => i[conflictKey] === item[conflictKey]);
    let result;
    
    if (existingIndex >= 0) {
      result = { ...data[table][existingIndex], ...item, updated_at: new Date().toISOString() };
      data[table][existingIndex] = result;
    } else {
      result = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      data[table].push(result);
    }
    
    saveLocalData(data);
    return result;
  }
};