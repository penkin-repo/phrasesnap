import { useState, useEffect } from 'react';
import { notesStorage } from '../utils/storage.js';
import { supabase } from '../utils/supabase.js';
import NoteList from './NoteList.jsx';
import NoteEditor from './NoteEditor.jsx';
import SearchBar from './SearchBar.jsx';
import SubgroupManager from './SubgroupManager.jsx';
import Auth from './Auth.jsx';
import { NotesListSkeleton, SubgroupsListSkeleton } from './Skeleton.jsx';

export default function App() {
   const [currentUser, setCurrentUser] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [notes, setNotes] = useState([]);
   const [subgroups, setSubgroups] = useState([]);
   const [isLoadingNotes, setIsLoadingNotes] = useState(false);
   const [isLoadingSubgroups, setIsLoadingSubgroups] = useState(false);
   const [selectedSubgroup, setSelectedSubgroup] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [editingNote, setEditingNote] = useState(null);
   const [showSubgroupManager, setShowSubgroupManager] = useState(false);
   const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'created' | 'title' | 'copied'
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [isDarkMode, setIsDarkMode] = useState(() => {
     if (typeof window !== 'undefined') {
       return localStorage.getItem('theme') === 'dark';
     }
     return false;
   });

  // Check for existing user session on component mount
   useEffect(() => {
     const checkUser = async () => {
       try {
         const { data: { session } } = await supabase.auth.getSession();
         if (session?.user) {
           handleLogin(session.user);
         }
       } catch (error) {
         console.error('Error checking session:', error);
       } finally {
         setIsLoading(false);
       }
     };

     checkUser();

     // Listen for auth changes
     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (session?.user) {
         handleLogin(session.user);
       } else {
         setCurrentUser(null);
         setNotes([]);
         setSubgroups([]);
         setSelectedSubgroup(null);
         setEditingNote(null);
         setShowSubgroupManager(false);
       }
       setIsLoading(false);
     });

     // Register service worker for PWA
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/sw.js')
         .then(registration => {
           console.log('SW registered: ', registration);
         })
         .catch(registrationError => {
           console.log('SW registration failed: ', registrationError);
         });
     }

     return () => subscription.unsubscribe();
   }, []);

  // Load data when user changes
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const loadData = async () => {
    try {
      setIsLoadingNotes(true);
      setIsLoadingSubgroups(true);

      // Load notes from Supabase
      const { data: notesData, error: notesError } = await supabase
        .from('newnotes')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false });

      if (notesError) {
        console.error('Error loading notes:', notesError);
        setNotes([]);
      } else {
        // Notes now include subgroup_id from Supabase
        const notesWithLocalSync = (notesData || []).map(note => {
          // Sync with localStorage for offline support
          const localNote = notesStorage.getById(note.id);
          if (!localNote) {
            notesStorage.create({
              id: note.id,
              title: note.title,
              content: note.content,
              subgroupId: note.subgroup_id
            });
          } else if (localNote.subgroupId !== note.subgroup_id) {
            // Update localStorage if Supabase has different subgroup_id
            notesStorage.update(note.id, { subgroupId: note.subgroup_id });
          }
          return note;
        });

        setNotes(notesWithLocalSync);
      }
      setIsLoadingNotes(false);

      // Load subgroups from Supabase
      const { data: subgroupsData, error: subgroupsError } = await supabase
        .from('subgroups')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true });

      if (subgroupsError) {
        console.error('Error loading subgroups:', subgroupsError);
        setSubgroups([]);
      } else {
        let loadedSubgroups = subgroupsData || [];

        // If no subgroups exist in Supabase, try to migrate from localStorage
        if (loadedSubgroups.length === 0) {
          const localSubgroups = subgroupsStorage.getAll();

          if (localSubgroups.length > 0) {
            // Migrate existing local subgroups to Supabase
            const supabaseSubgroups = localSubgroups.map(subgroup => ({
              user_id: currentUser.id,
              name: subgroup.name,
              color: subgroup.color
            }));

            const { data: migratedSubgroups, error: migrateError } = await supabase
              .from('subgroups')
              .insert(supabaseSubgroups)
              .select();

            if (!migrateError && migratedSubgroups) {
              loadedSubgroups = migratedSubgroups;
              console.log('Successfully migrated subgroups from localStorage to Supabase');
            }
          } else {
            // Create default subgroups if no local ones exist
            const defaultSubgroups = [
              { user_id: currentUser.id, name: 'Work', color: '#3b82f6' },
              { user_id: currentUser.id, name: 'Personal', color: '#10b981' },
              { user_id: currentUser.id, name: 'Ideas', color: '#f59e0b' }
            ];

            const { data: createdSubgroups, error: createError } = await supabase
              .from('subgroups')
              .insert(defaultSubgroups)
              .select();

            if (!createError && createdSubgroups) {
              loadedSubgroups = createdSubgroups;
            }
          }
        }

        setSubgroups(loadedSubgroups);
      }
      setIsLoadingSubgroups(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setNotes([]);
      setSubgroups([]);
      setIsLoadingNotes(false);
      setIsLoadingSubgroups(false);
    }
  };

  const handleLogin = (user) => {
    // Adapt Supabase user object to match expected format
    const adaptedUser = {
      id: user.id,
      email: user.email,
      username: user.email, // Use email as username for display
      createdAt: user.created_at
    };
    setCurrentUser(adaptedUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear localStorage on logout (keeping only notes for offline support)
    localStorage.removeItem('notes_app_notes');
    // The auth state change listener will handle clearing the state
  };

  // Filter notes based on subgroup and search
  const filteredNotes = notes.filter(note => {
    const matchesSubgroup = !selectedSubgroup || note.subgroup_id === selectedSubgroup;
    const matchesSearch = !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSubgroup && matchesSearch;
  });

  // Handle note operations
  const handleCreateNote = async () => {
    try {
      const { data, error } = await supabase
        .from('newnotes')
        .insert({
          user_id: currentUser.id,
          title: 'New Note',
          content: '',
          subgroup_id: selectedSubgroup || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        return;
      }

      // Save to localStorage for offline support
      notesStorage.create({
        id: data.id,
        title: data.title,
        content: data.content,
        subgroupId: selectedSubgroup
      });

      setNotes(prev => [data, ...prev]);
      setEditingNote(data.id);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('newnotes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating note:', error);
        return;
      }

      // Update localStorage to sync with Supabase
      if (updates.subgroup_id !== undefined) {
        const localNote = notesStorage.getById(id);
        if (localNote) {
          notesStorage.update(id, { subgroupId: updates.subgroup_id });
        } else {
          // Create local note entry if it doesn't exist
          notesStorage.create({
            id: id,
            title: data.title,
            content: data.content,
            subgroupId: updates.subgroup_id
          });
        }
      }

      setNotes(prev => prev.map(note =>
        note.id === id ? data : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const { error } = await supabase
        .from('newnotes')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error deleting note:', error);
        return;
      }

      // Also delete from localStorage
      notesStorage.delete(id);

      setNotes(prev => prev.filter(note => note.id !== id));
      if (editingNote === id) {
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleCopyNote = async (note) => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);

      // Increment copy count in Supabase
      const newCopyCount = (note.copy_count || 0) + 1;
      const { data, error } = await supabase
        .from('newnotes')
        .update({
          copy_count: newCopyCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating copy count:', error);
        return;
      }

      // Update localStorage copy count
      notesStorage.update(note.id, { copyCount: newCopyCount });

      setNotes(prev => prev.map(n =>
        n.id === note.id ? data : n
      ));

      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy note:', error);
    }
  };

  // Handle subgroup operations
   const handleCreateSubgroup = async (name, color) => {
     try {
       const { data, error } = await supabase
         .from('subgroups')
         .insert({
           user_id: currentUser.id,
           name,
           color
         })
         .select()
         .single();

       if (error) {
         console.error('Error creating subgroup:', error);
         return;
       }

       setSubgroups(prev => [...prev, data]);
     } catch (error) {
       console.error('Error creating subgroup:', error);
     }
   };

   const handleUpdateSubgroup = async (id, updates) => {
     try {
       const { data, error } = await supabase
         .from('subgroups')
         .update({
           ...updates,
           updated_at: new Date().toISOString()
         })
         .eq('id', id)
         .eq('user_id', currentUser.id)
         .select()
         .single();

       if (error) {
         console.error('Error updating subgroup:', error);
         return;
       }

       setSubgroups(prev => prev.map(subgroup =>
         subgroup.id === id ? data : subgroup
       ));
     } catch (error) {
       console.error('Error updating subgroup:', error);
     }
   };

   const handleDeleteSubgroup = async (id) => {
     try {
       // First, update all notes in this subgroup to have null subgroup_id
       const { error: updateNotesError } = await supabase
         .from('newnotes')
         .update({ subgroup_id: null })
         .eq('subgroup_id', id)
         .eq('user_id', currentUser.id);

       if (updateNotesError) {
         console.error('Error updating notes:', updateNotesError);
       }

       // Then delete the subgroup
       const { error: deleteError } = await supabase
         .from('subgroups')
         .delete()
         .eq('id', id)
         .eq('user_id', currentUser.id);

       if (deleteError) {
         console.error('Error deleting subgroup:', deleteError);
         return;
       }

       setSubgroups(prev => prev.filter(subgroup => subgroup.id !== id));
       if (selectedSubgroup === id) {
         setSelectedSubgroup(null);
       }

       // Update local notes to reflect the change
       setNotes(prev => prev.map(note =>
         note.subgroup_id === id ? { ...note, subgroup_id: null } : note
       ));
     } catch (error) {
       console.error('Error deleting subgroup:', error);
     }
   };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden mr-3 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title="Toggle sidebar"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center transition-colors">
                <svg className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                PhraseSnap
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Desktop welcome message */}
              <span className="hidden lg:inline text-sm text-gray-600 dark:text-gray-300">
                Welcome, {currentUser?.username}
              </span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {/* Desktop logout button */}
              <button
                onClick={handleLogout}
                className="hidden lg:inline-flex px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
              >
                Logout
              </button>
              {/* Mobile logout icon */}
              <button
                onClick={handleLogout}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title="Logout"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              <button
                onClick={() => setShowSubgroupManager(!showSubgroupManager)}
                className="hidden lg:inline-flex px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
              >
                Manage Groups
              </button>
              <button
                onClick={handleCreateNote}
                className="hidden lg:inline-flex px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer"
              >
                New Note
              </button>
              <button
                onClick={handleCreateNote}
                className="lg:hidden p-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer"
                title="New Note"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transition-colors">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-6">
                {/* Subgroups */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Groups</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedSubgroup(null);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                        selectedSubgroup === null
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      All Phrases ({notes.length})
                    </button>
                    {subgroups.map(subgroup => (
                      <button
                        key={subgroup.id}
                        onClick={() => {
                          setSelectedSubgroup(subgroup.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center cursor-pointer ${
                          selectedSubgroup === subgroup.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: subgroup.color }}
                        />
                        {subgroup.name}
                        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                          ({notes.filter(note => note.subgroup_id === subgroup.id).length})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manage Groups */}
                <div>
                  <button
                    onClick={() => {
                      setShowSubgroupManager(true);
                      setIsSidebarOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    Manage Groups
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile User Info and Search */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              Welcome, {currentUser?.username}
            </span>
          </div>
          <div className="mb-6">
            <div className="lg:hidden mobile-search">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="space-y-6">
              {/* Search */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />

              {/* Subgroups */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Groups</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedSubgroup(null)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedSubgroup === null
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Phrases ({notes.length})
                  </button>
                  {isLoadingSubgroups ? (
                    <SubgroupsListSkeleton count={3} />
                  ) : (
                    subgroups.map(subgroup => (
                      <button
                        key={subgroup.id}
                        onClick={() => setSelectedSubgroup(subgroup.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center ${
                          selectedSubgroup === subgroup.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: subgroup.color }}
                        />
                        {subgroup.name}
                        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                          ({notes.filter(note => note.subgroup_id === subgroup.id).length})
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {editingNote ? (
              <NoteEditor
                note={notes.find(note => note.id === editingNote)}
                onSave={handleUpdateNote}
                onCancel={() => setEditingNote(null)}
                subgroups={subgroups}
              />
            ) : isLoadingNotes ? (
              <NotesListSkeleton count={6} />
            ) : (
              <NoteList
                notes={filteredNotes}
                subgroups={subgroups}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
                onCopy={handleCopyNote}
              />
            )}
          </div>
        </div>
      </main>

      {/* Subgroup Manager Modal */}
      {showSubgroupManager && (
        <SubgroupManager
          subgroups={subgroups}
          onCreate={handleCreateSubgroup}
          onUpdate={handleUpdateSubgroup}
          onDelete={handleDeleteSubgroup}
          onClose={() => setShowSubgroupManager(false)}
        />
      )}
    </div>
  );
}