// Storage utility for managing notes and subgroups in localStorage

const STORAGE_KEYS = {
  NOTES: 'notes_app_notes',
  SUBGROUPS: 'notes_app_subgroups'
};

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Notes operations
export const notesStorage = {
  // Get all notes
  getAll: () => {
    try {
      const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  // Get note by ID
  getById: (id) => {
    const notes = notesStorage.getAll();
    return notes.find(note => note.id === id);
  },

  // Create new note
  create: (noteData) => {
    const notes = notesStorage.getAll();
    const newNote = {
      id: generateId(),
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      subgroupId: noteData.subgroupId || null,
      copyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    notes.push(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return newNote;
  },

  // Update note
  update: (id, updates) => {
    const notes = notesStorage.getAll();
    const noteIndex = notes.findIndex(note => note.id === id);

    if (noteIndex === -1) return null;

    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return notes[noteIndex];
  },

  // Delete note
  delete: (id) => {
    const notes = notesStorage.getAll();
    const filteredNotes = notes.filter(note => note.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filteredNotes));
    return true;
  },

  // Get notes by subgroup
  getBySubgroup: (subgroupId) => {
    const notes = notesStorage.getAll();
    if (!subgroupId) return notes.filter(note => !note.subgroupId);
    return notes.filter(note => note.subgroupId === subgroupId);
  },

  // Search notes
  search: (query) => {
    if (!query.trim()) return notesStorage.getAll();

    const notes = notesStorage.getAll();
    const searchTerm = query.toLowerCase();

    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    );
  },

  // Increment copy count
  incrementCopyCount: (id) => {
    const notes = notesStorage.getAll();
    const noteIndex = notes.findIndex(note => note.id === id);

    if (noteIndex === -1) return null;

    notes[noteIndex].copyCount = (notes[noteIndex].copyCount || 0) + 1;
    notes[noteIndex].updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return notes[noteIndex];
  },

  // Get notes sorted by copy count
  getByCopyCount: () => {
    const notes = notesStorage.getAll();
    return notes.sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
  }
};

// Subgroups operations
export const subgroupsStorage = {
  // Get all subgroups
  getAll: () => {
    try {
      const subgroups = localStorage.getItem(STORAGE_KEYS.SUBGROUPS);
      return subgroups ? JSON.parse(subgroups) : [];
    } catch (error) {
      console.error('Error getting subgroups:', error);
      return [];
    }
  },

  // Get subgroup by ID
  getById: (id) => {
    const subgroups = subgroupsStorage.getAll();
    return subgroups.find(subgroup => subgroup.id === id);
  },

  // Create new subgroup
  create: (subgroupData) => {
    const subgroups = subgroupsStorage.getAll();
    const newSubgroup = {
      id: generateId(),
      name: subgroupData.name || 'New Group',
      color: subgroupData.color || '#3b82f6',
      createdAt: new Date().toISOString()
    };

    subgroups.push(newSubgroup);
    localStorage.setItem(STORAGE_KEYS.SUBGROUPS, JSON.stringify(subgroups));
    return newSubgroup;
  },

  // Update subgroup
  update: (id, updates) => {
    const subgroups = subgroupsStorage.getAll();
    const subgroupIndex = subgroups.findIndex(subgroup => subgroup.id === id);

    if (subgroupIndex === -1) return null;

    subgroups[subgroupIndex] = {
      ...subgroups[subgroupIndex],
      ...updates
    };

    localStorage.setItem(STORAGE_KEYS.SUBGROUPS, JSON.stringify(subgroups));
    return subgroups[subgroupIndex];
  },

  // Delete subgroup and move notes to root
  delete: (id) => {
    const subgroups = subgroupsStorage.getAll();
    const filteredSubgroups = subgroups.filter(subgroup => subgroup.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBGROUPS, JSON.stringify(filteredSubgroups));

    // Move notes from this subgroup to root
    const notes = notesStorage.getAll();
    const updatedNotes = notes.map(note =>
      note.subgroupId === id ? { ...note, subgroupId: null } : note
    );
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));

    return true;
  }
};

// Utility functions
export const storageUtils = {
  // Clear all data
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.SUBGROUPS);
  },

  // Export data
  exportData: () => {
    return {
      notes: notesStorage.getAll(),
      subgroups: subgroupsStorage.getAll(),
      exportedAt: new Date().toISOString()
    };
  },

  // Import data
  importData: (data) => {
    try {
      if (data.notes) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data.notes));
      }
      if (data.subgroups) {
        localStorage.setItem(STORAGE_KEYS.SUBGROUPS, JSON.stringify(data.subgroups));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};