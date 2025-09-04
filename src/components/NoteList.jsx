import { useState } from 'react';

export default function NoteList({ notes, subgroups, sortBy, onSortChange, onEdit, onDelete, onCopy }) {
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Sort notes
  const sortedNotes = [...notes].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'updated':
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  const getSubgroupName = (subgroupId) => {
    if (!subgroupId) return null;
    const subgroup = subgroups.find(s => s.id === subgroupId);
    return subgroup ? subgroup.name : null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="relative">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {/* Copy icon overlay */}
          <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notes found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating your first note.
        </p>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Pro tip:</strong> Use the blue "Copy" button to quickly copy notes to your clipboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="updated">Last updated</option>
            <option value="created">Date created</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        {sortedNotes.map(note => (
          <div
            key={note.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow flex flex-col max-w-full"
          >
            {/* Note Title and Subgroup in one line */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex-1 mr-2 truncate overflow-wrap-break-word break-all word-break-break-word overflow-wrap-break-word max-w-[200px]">
                {note.title || 'Untitled'}
              </h3>
              {getSubgroupName(note.subgroupId) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex-shrink-0">
                  {getSubgroupName(note.subgroupId)}
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 flex-1 break-words overflow-hidden mb-4 line-clamp-1 max-h-[15px] max-w-full break-all word-break-break-word overflow-wrap-break-word">
              {truncateContent(note.content, 200)}
            </div>

            {/* Separator */}
            <hr className="border-gray-200 dark:border-gray-600 mb-3" />

            {/* Control Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  onCopy(note);
                  setCopyFeedback(note.id);
                  setTimeout(() => setCopyFeedback(null), 2000);
                }}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
                title="Copy note to clipboard"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copyFeedback === note.id ? 'Copied' : 'Copy'}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(note.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
                  title="Edit note"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this note?')) {
                      onDelete(note.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete note"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}