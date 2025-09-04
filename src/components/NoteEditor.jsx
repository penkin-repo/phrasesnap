import { useState, useEffect } from 'react';

export default function NoteEditor({ note, onSave, onCancel, subgroups }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedSubgroup(note.subgroup_id || null);
    } else {
      setTitle('');
      setContent('');
      setSelectedSubgroup(null);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    try {
      await onSave(note.id, {
        title: title.trim() || 'Untitled',
        content: content.trim(),
        subgroup_id: selectedSubgroup
      });
      onCancel();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ctrl+S to save • Esc to cancel
            </span>
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
              tabIndex={5}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || (!title.trim() && !content.trim())}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              tabIndex={4}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-xl font-medium border-0 border-b-2 border-transparent focus:border-blue-500 focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 dark:text-white bg-transparent"
              autoFocus
              tabIndex={1}
            />
          </div>

          {/* Subgroup Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group (optional)
            </label>
            <select
              value={selectedSubgroup || ''}
              onChange={(e) => setSelectedSubgroup(e.target.value || null)}
              className="block w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              tabIndex={2}
            >
              <option value="">No group</option>
              {subgroups.map(subgroup => (
                <option key={subgroup.id} value={subgroup.id}>
                  {subgroup.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Textarea */}
          <div>
            <textarea
              placeholder="Start writing your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={15}
              className="w-full px-3 py-2 border-0 resize-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-transparent"
              style={{ minHeight: '400px' }}
              tabIndex={3}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            {note && (
              <span>
                Created: {new Date(note.createdAt).toLocaleDateString()} •
                Updated: {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>{content.length} characters</span>
            <span>{content.split('\n').length} lines</span>
          </div>
        </div>
      </div>
    </div>
  );
}