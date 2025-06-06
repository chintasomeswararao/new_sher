'use client';

import {
  memo,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { BlockKind, UIBlock, CustomDocument } from './block';
import { FileIcon, FullscreenIcon, LoaderIcon } from './icons';
import { cn, fetcher } from '@/lib/utils';
import { InlineDocumentSkeleton } from './document-skeleton';
import useSWR from 'swr';
import { Editor } from './editor';
import { DocumentToolCall, DocumentToolResult } from './document';
import { CodeEditor } from './code-editor';
import { useBlock } from '@/hooks/use-block';
import equal from 'fast-deep-equal';
import { SpreadsheetEditor } from './spreadsheet-editor';

interface DocumentPreviewProps {
  isReadonly: boolean;
  result?: CustomDocument;
  args?: any;
}

export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { block, setBlock } = useBlock();

  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Array<CustomDocument>
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();
    if (result?.id && boundingBox) {
      setBlock((block) => ({
        ...block,
        id: result.id,
        status: 'streaming'
      }));
    }
  }, [result?.id, setBlock]);

  if (block.status === 'streaming') {
    if (result) {
      return (
        <DocumentToolResult
          type="create"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          type="create"
          args={{ title: args.title }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton />;
  }

  const document: CustomDocument | null = previewDocument
    ? previewDocument
    : block.status === 'streaming' && block.content && typeof block.content === 'object' && 'content' in block.content
      ? {
          id: block.id,
          title: (block.content as CustomDocument).title || '',
          kind: ((block.content as CustomDocument).kind || 'text') as BlockKind,
          content: (block.content as CustomDocument).content || '',
          createdAt: new Date(),
          userId: 'noop',
        }
      : null;

  if (!document) return <LoadingSkeleton />;

  return (
    <div className="relative w-full cursor-pointer">
      <HitboxLayer hitboxRef={hitboxRef} result={result} setBlock={setBlock} />
      <DocumentHeader
        title={document.title}
        isStreaming={block.status === 'streaming'}
      />
      <DocumentContent document={document} />
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="w-full">
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted h-[57px] dark:border-zinc-700 border-b-0">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-24" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    <div className="overflow-y-scroll border rounded-b-2xl p-8 pt-4 bg-muted border-t-0 dark:border-zinc-700">
      <InlineDocumentSkeleton />
    </div>
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setBlock,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result: any;
  setBlock: (updaterFn: UIBlock | ((currentBlock: UIBlock) => UIBlock)) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setBlock((block) =>
        block.status === 'streaming'
          ? { ...block, isVisible: true }
          : {
              ...block,
              documentId: result.id,
              kind: result.kind,
              isVisible: true,
              boundingBox: {
                left: boundingBox.x,
                top: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
              },
            },
      );
    },
    [setBlock, result],
  );

  return (
    <div
      className="size-full absolute top-0 left-0 rounded-xl z-10"
      ref={hitboxRef}
      onClick={handleClick}
      role="presentation"
      aria-hidden="true"
    />
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});

const PureDocumentHeader = ({
  title,
  isStreaming,
}: {
  title: string;
  isStreaming: boolean;
}) => (
  <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
    <div className="flex flex-row items-start sm:items-center gap-3">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 sm:translate-y-0 font-medium">{title}</div>
    </div>
    <div>
      <FullscreenIcon />
    </div>
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});

const DocumentContent = ({ document }: { document: CustomDocument }) => {
  const { block } = useBlock();

  const containerClassName = cn(
    'h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code',
    },
  );

  const commonProps = {
    content: document.content ?? '',
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: (block.status === 'streaming' ? 'streaming' : 'idle') as 'streaming' | 'idle',
    saveContent: () => {},
    suggestions: [],
  };

  return (
    <div className={containerClassName}>
      {document.kind === 'text' ? (
        <Editor {...commonProps} />
      ) : document.kind === 'code' ? (
        <div className="flex flex-1 relative w-full">
          <div className="absolute inset-0">
            <CodeEditor {...commonProps} />
          </div>
        </div>
      ) : document.kind === 'spreadsheet' ? (
        <div className="flex flex-1 relative w-full p-4">
          <div className="absolute inset-0">
            <SpreadsheetEditor {...commonProps} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
