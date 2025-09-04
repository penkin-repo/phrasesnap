import { useState, useEffect } from 'react';

export default function SubgroupManager({ subgroups, onCreate, onUpdate, onDelete, onClose }) {
  const [newSubgroupName, setNewSubgroupName] = useState('');
  const [newSubgroupColor, setNewSubgroupColor] = useState('#3b82f6');
  const [editingSubgroup, setEditingSubgroup] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const predefinedColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6b7280', // gray
    '#f97316', // orange
  ];

  const handleCreateSubgroup = () => {
    if (!newSubgroupName.trim()) return;

    onCreate(newSubgroupName.trim(), newSubgroupColor);
    setNewSubgroupName('');
  };

  const handleStartEdit = (subgroup) => {
    setEditingSubgroup(subgroup.id);
    setEditName(subgroup.name);
    setEditColor(subgroup.color);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;

    onUpdate(editingSubgroup, {
      name: editName.trim(),
      color: editColor
    });
    setEditingSubgroup(null);
    setEditName('');
    setEditColor('');
  };

  const handleCancelEdit = () => {
    setEditingSubgroup(null);
    setEditName('');
    setEditColor('');
  };

  const handleDeleteSubgroup = (id) => {
    if (confirm('Are you sure you want to delete this group? All notes in this group will be moved to "All Notes".')) {
      onDelete(id);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingSubgroup) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingSubgroup, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Manage Groups</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {/* Create New Group */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Create New Group</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Group name..."
                value={newSubgroupName}
                onChange={(e) => setNewSubgroupName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSubgroup()}
              />

              {/* Color Picker */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewSubgroupColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                        newSubgroupColor === color ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateSubgroup}
                disabled={!newSubgroupName.trim()}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Create Group
              </button>
            </div>
          </div>

          {/* Existing Groups */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Existing Groups ({subgroups.length})
            </h3>

            {subgroups.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No groups created yet
              </p>
            ) : (
              <div className="space-y-3">
                {subgroups.map(subgroup => (
                  <div key={subgroup.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    {editingSubgroup === subgroup.id ? (
                      // Edit Mode
                      <div className="flex-1 mr-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                          autoFocus
                        />
                        <div className="flex gap-1 mt-2">
                          {predefinedColors.map(color => (
                            <button
                              key={color}
                              onClick={() => setEditColor(color)}
                              className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                                editColor === color ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center flex-1">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: subgroup.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {subgroup.name}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      {editingSubgroup === subgroup.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors cursor-pointer"
                            title="Save"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(subgroup)}
                            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSubgroup(subgroup.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}