import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { UIBlock } from "./block";

interface BlockToolbarProps {
  block: UIBlock;
  onDelete: () => void;
  onUpdate: (updates: Partial<UIBlock>) => void;
}

export function BlockToolbar({ block, onDelete, onUpdate }: BlockToolbarProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
} 