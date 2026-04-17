const Storage = (() => {
  const isElectron = () =>
    typeof window !== 'undefined' &&
    typeof window.electronAPI !== 'undefined';

  const electronProvider = {
    notes: {
      getAll: ()      => window.electronAPI.notes.getAll(),
      save:   (notes) => window.electronAPI.notes.save(notes),
    },
    mood: {
      getAll: ()      => window.electronAPI.mood.getAll(),
      save:   (entry) => window.electronAPI.mood.save(entry),
    },
    sessions: {
      getAll: () => window.electronAPI.sessions.getAll(),
      add: (session) => window.electronAPI.sessions.add(session),
    },
    access: {
      getAll: () => window.electronAPI.access.getAll(),
      logToday: () => window.electronAPI.access.logToday(),
    }
  };

  const localProvider = {
    notes: {
      getAll: () =>
        Promise.resolve(JSON.parse(localStorage.getItem('notes') || '[]')),
      save: (notes) => {
        localStorage.setItem('notes', JSON.stringify(notes));
        return Promise.resolve();
      },
    },
    mood: {
      getAll: () =>
        Promise.resolve(JSON.parse(localStorage.getItem('mood') || '[]')),
      save: (entry) => {
        const log = JSON.parse(localStorage.getItem('mood') || '[]');
        const idx = log.findIndex(e => e.date === entry.date);
        if (idx !== -1) {
          log[idx] = entry;
        } else {
          log.push(entry);
        }
        localStorage.setItem('mood', JSON.stringify(log));
        return Promise.resolve();
      },
    },

    sessions: {
    getAll: () => JSON.parse(localStorage.getItem('sessions') || '[]'),
    add: (session) => {
      const data = JSON.parse(localStorage.getItem('sessions') || '[]');
      data.push(session);
      localStorage.setItem('sessions', JSON.stringify(data));
      return Promise.resolve(); 
    },
  },

  access: {
    getAll: () => JSON.parse(localStorage.getItem('access') || '[]'),
    logToday: () => {
      const data = JSON.parse(localStorage.getItem('access') || '[]');
      const today = new Date().toISOString().slice(0, 10);

      if (!data.some(e => e.date === today)) {
        data.push({ date: today });
        localStorage.setItem('access', JSON.stringify(data));
        return Promise.resolve();
      }
    },
  }
};

  return isElectron() ? electronProvider : localProvider;
})();
