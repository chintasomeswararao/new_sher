// components/new-query-input.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Send } from 'lucide-react';

interface NewQueryInputProps {
  chatId: string;
  onSubmit: (query: string) => Promise<void>;
  disabled?: boolean;
}

export function NewQueryInput({ chatId, onSubmit, disabled }: NewQueryInputProps) {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(query);
      setQuery('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="w-full"
        variant="outline"
        disabled={disabled}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Ask a Follow-up Question
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Ask a follow-up question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={3}
            className="resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!query.trim() || isSubmitting}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Question'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setQuery('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}