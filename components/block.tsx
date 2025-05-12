import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from "ai";
import { formatDistance } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";

import { cn, fetcher } from "@/lib/utils";

import { DiffView } from "./diffview";
import { DocumentSkeleton } from "./document-skeleton";
import { Editor } from "./editor";
import { MultimodalInput } from "./multimodal-input";
import { Toolbar } from "./toolbar";
import { VersionFooter } from "./version-footer";
import { BlockActions } from "./block-actions";
import { BlockCloseButton } from "./block-close-button";
import { BlockMessages } from "./block-messages";
import { CodeEditor } from "./code-editor";
import { Console } from "./console";
import { useSidebar } from "./ui/sidebar";
import { useBlock } from "@/hooks/use-block";
import equal from "fast-deep-equal";
import { SpreadsheetEditor } from "./spreadsheet-editor";
import { DocumentPreview } from "./document-preview";
import { ExtractResults } from "./extract-results";
import { ScrapeResults } from "./scrape-results";
import { BlockToolbar } from "./block-toolbar";
import { useDeepResearch } from "@/lib/deep-research-context";
import { Progress } from "./ui/progress";

/** Type representing the possible block kinds: 'text' | 'code' | 'spreadsheet' */
export type BlockKind = "text" | "code" | "spreadsheet";

export const BLOCK_KINDS: BlockKind[] = ["text", "code", "spreadsheet"];

export type MessageContent = {
  type: 'text' | 'tool-call';
  text?: string;
  toolCallId?: string;
  toolName?: string;
  args?: Record<string, any>;
};

export type DBMessage = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string | MessageContent[];
  createdAt: Date;
};

export type Chat = {
  id: string;
  title: string;
  visibility: 'private' | 'public';
  userId: string;
  createdAt: Date;
};

export type CustomDocument = {
  id: string;
  title: string;
  content: string;
  kind: BlockKind;
  userId: string;
  createdAt: Date;
};

export type Suggestion = {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  originalText: string;
  suggestedText: string;
  description: string;
};

export type Vote = {
  id: string;
  messageId: string;
  userId: string;
  value: 'up' | 'down';
  createdAt: Date;
};

export type UIBlock = {
  id: string;
  type: 'document' | 'suggestion' | 'chat';
  status: 'idle' | 'loading' | 'streaming' | 'error';
  content: CustomDocument | Suggestion | Message[];
  error?: string;
  documentId?: string;
  isVisible: boolean;
  boundingBox?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export interface ConsoleOutputContent {
  type: "text" | "image";
  value: string;
}

export interface ConsoleOutput {
  id: string;
  status: "in_progress" | "loading_packages" | "completed" | "failed";
  contents: Array<ConsoleOutputContent>;
}

type SearchMode = "deep-research";

interface BlockProps {
  block: UIBlock;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<UIBlock>) => void;
  onVote?: (messageId: string, vote: 'up' | 'down') => void;
  votes?: Vote[];
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  reload: (chatRequestOptions?: any) => Promise<string | null | undefined>;
  isReadonly?: boolean;
}

export function Block({
  block,
  onDelete,
  onUpdate,
  onVote,
  votes = [],
  setMessages,
  reload,
  isReadonly = false,
}: BlockProps) {
  const { width } = useWindowSize();
  const { state } = useDeepResearch();

  const handleDelete = useDebounceCallback(() => {
    if (block?.id) {
      onDelete(block.id);
    }
  }, 300);

  const handleUpdate = useDebounceCallback((updates: Partial<UIBlock>) => {
    if (block?.id) {
      onUpdate(block.id, updates);
    }
  }, 300);

  const renderContent = () => {
    if (!block) {
      return null;
    }

    switch (block.type) {
      case 'document':
        return (
          <DocumentPreview
            isReadonly={isReadonly}
            result={block.content as CustomDocument}
          />
        );
      case 'suggestion':
        const suggestion = block.content as Suggestion;
        return (
          <DiffView
            oldContent={suggestion.content}
            newContent={suggestion.content}
          />
        );
      case 'chat':
        return (
          <BlockMessages
            chatId={block.id}
            messages={block.content as Message[]}
            isLoading={block.status === 'streaming'}
            votes={votes}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
          />
        );
      default:
        return null;
    }
  };

  if (!block) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <BlockToolbar
        block={block}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
      {renderContent()}
      {state?.isActive && (
        <div className="w-full">
          <Progress value={(state.completedSteps / state.totalExpectedSteps) * 100} />
        </div>
      )}
    </div>
  );
}
