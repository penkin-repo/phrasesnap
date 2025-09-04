import React from 'react';

export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    />
  );
}

// Skeleton for a note item
export function NoteSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for a subgroup item
export function SubgroupSkeleton() {
  return (
    <div className="flex items-center px-3 py-2">
      <Skeleton className="h-3 w-3 rounded-full mr-2" />
      <Skeleton className="h-4 w-20 mr-auto" />
      <Skeleton className="h-4 w-8" />
    </div>
  );
}

// Skeleton for notes list
export function NotesListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <NoteSkeleton key={index} />
      ))}
    </div>
  );
}

// Skeleton for subgroups list
export function SubgroupsListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <SubgroupSkeleton key={index} />
      ))}
    </div>
  );
}