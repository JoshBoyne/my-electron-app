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
  };

  return isElectron() ? electronProvider : localProvider;
})();
