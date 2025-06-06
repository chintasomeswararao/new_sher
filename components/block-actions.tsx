import { cn } from '@/lib/utils';
import {
  ClockRewind,
  CopyIcon,
  RedoIcon,
  UndoIcon,
  ArrowUpIcon,
  DownloadIcon,
} from './icons';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import { ConsoleOutput, UIBlock } from './block';
import { Dispatch, memo, SetStateAction } from 'react';
import { RunCodeButton } from './run-code-button';
import { exportToCSV } from '@/lib/spreadsheet';

interface BlockActionsProps {
  block: UIBlock;
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  mode: 'read-only' | 'edit' | 'diff';
  setConsoleOutputs: Dispatch<SetStateAction<Array<ConsoleOutput>>>;
}

function PureBlockActions({
  block,
  handleVersionChange,
  currentVersionIndex,
  isCurrentVersion,
  mode,
  setConsoleOutputs,
}: BlockActionsProps) {
  const [_, copyToClipboard] = useCopyToClipboard();

  const handleExportCSV = () => {
    try {
      if (block.type === 'document' && typeof block.content === 'object' && 'content' in block.content) {
        exportToCSV(block.content.content);
        toast.success('CSV file downloaded!');
      } else {
        toast.error('Cannot export this content type to CSV');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to export CSV');
    }
  };

  const handleCopyToClipboard = () => {
    try {
      let contentToCopy: string;
      if (typeof block.content === 'string') {
        contentToCopy = block.content;
      } else if (Array.isArray(block.content)) {
        contentToCopy = JSON.stringify(block.content, null, 2);
      } else if (typeof block.content === 'object' && 'content' in block.content) {
        contentToCopy = block.content.content;
      } else {
        contentToCopy = JSON.stringify(block.content, null, 2);
      }
      copyToClipboard(contentToCopy);
      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="flex flex-row gap-1">
      {block.type === 'document' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="p-2 h-fit dark:hover:bg-zinc-700 !pointer-events-auto"
              onClick={handleExportCSV}
              disabled={block.status === 'streaming'}
            >
              <DownloadIcon size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download as CSV</TooltipContent>
        </Tooltip>
      )}

      {block.type === 'suggestion' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'p-2 h-fit !pointer-events-auto dark:hover:bg-zinc-700',
                {
                  'bg-muted': mode === 'diff',
                },
              )}
              onClick={() => {
                handleVersionChange('toggle');
              }}
              disabled={
                block.status === 'streaming' || currentVersionIndex === 0
              }
            >
              <ClockRewind size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View changes</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="p-2 h-fit dark:hover:bg-zinc-700 !pointer-events-auto"
            onClick={() => {
              handleVersionChange('prev');
            }}
            disabled={currentVersionIndex === 0 || block.status === 'streaming'}
          >
            <UndoIcon size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View Previous version</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="p-2 h-fit dark:hover:bg-zinc-700 !pointer-events-auto"
            onClick={() => {
              handleVersionChange('next');
            }}
            disabled={isCurrentVersion || block.status === 'streaming'}
          >
            <RedoIcon size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View Next version</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="p-2 h-fit dark:hover:bg-zinc-700"
            onClick={handleCopyToClipboard}
            disabled={block.status === 'streaming'}
          >
            <CopyIcon size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy to clipboard</TooltipContent>
      </Tooltip>
    </div>
  );
}

export const BlockActions = memo(PureBlockActions, (prevProps, nextProps) => {
  if (prevProps.block.status !== nextProps.block.status) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex)
    return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;

  return true;
});
