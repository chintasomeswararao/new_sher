'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';

interface QueryItem {
  id: number;
  query_text: string;
  parent_id: number;
  is_selected: boolean;
  created_at: string;
}

interface QueryListProps {
  queries: QueryItem[];
  onEdit?: (id: number, newText: string) => void;
  onDelete?: (id: number) => void;
  onToggleSelection?: (id: number, currentlySelected: boolean) => void;
  disabled?: boolean;
  onOperationStart?: () => void;
  onOperationEnd?: () => void;
}

export function QueryList({ 
  queries, 
  onEdit, 
  onDelete, 
  onToggleSelection, 
  disabled,
  onOperationStart,
  onOperationEnd 
}: QueryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');

  const handleEditClick = (query: QueryItem) => {
    if (onOperationStart) onOperationStart();
    setEditingId(query.id);
    setEditText(query.query_text);
    if (onOperationEnd) onOperationEnd();
  };

  const handleSaveEdit = (id: number) => {
    if (onEdit && editText.trim() !== '') {
      if (onOperationStart) onOperationStart();
      onEdit(id, editText);
      if (onOperationEnd) onOperationEnd();
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    if (onOperationStart) onOperationStart();
    setEditingId(null);
    if (onOperationEnd) onOperationEnd();
  };

  const handleDeleteClick = (id: number) => {
    if (onDelete) {
      if (onOperationStart) onOperationStart();
      onDelete(id);
      if (onOperationEnd) onOperationEnd();
    }
  };

  const handleToggleSelectionClick = (query: QueryItem) => {
    if (onToggleSelection) {
      if (onOperationStart) onOperationStart();
      onToggleSelection(query.id, query.is_selected);
      if (onOperationEnd) onOperationEnd();
    }
  };

  if (!queries || queries.length === 0) {
    return <div className="text-muted-foreground">No queries available</div>;
  }

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-xl font-semibold mb-4">Generated Research Queries ({queries.length})</h3>
      <p className="text-sm text-muted-foreground mb-4">
        These queries were generated based on your original question. You can edit or delete them.
      </p>
      <div className="space-y-3">
        {queries.map((query) => (
          <div 
            key={query.id} 
            className="flex items-center justify-between p-4 bg-muted/50 rounded-md border"
          >
            {editingId === query.id ? (
              <div className="flex items-center gap-2 w-full">
                <Input 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSaveEdit(query.id)}
                  className="text-green-500"
                  disabled={disabled}
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancelEdit}
                  className="text-red-500"
                  disabled={disabled}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="break-words flex-1 mr-2">
                  <span className={`font-medium ${!query.is_selected ? 'text-muted-foreground' : ''}`}>
                    {query.query_text}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {onToggleSelection && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleSelectionClick(query)}
                      className="h-8 w-8 p-0"
                      title={query.is_selected ? "Deselect query" : "Select query"}
                      disabled={disabled}
                    >
                      {query.is_selected ? (
                        <ToggleRightIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeftIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditClick(query)}
                    className="h-8 w-8 p-0"
                    title="Edit query"
                    disabled={disabled}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteClick(query.id)}
                    className="h-8 w-8 p-0 text-red-500"
                    title="Delete query"
                    disabled={disabled}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 