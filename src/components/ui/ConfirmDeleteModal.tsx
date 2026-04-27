import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  title?: string;
  description?: string;
}

export function ConfirmDeleteModal({
  open, onClose, onConfirm, itemName, title = "Delete item", description,
}: ConfirmDeleteProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const matches = value.trim() === itemName;

  const handleConfirm = async () => {
    if (!matches) return;
    setLoading(true);
    try { await onConfirm(); onClose(); setValue(""); }
    finally { setLoading(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { if (!loading) { onClose(); setValue(""); } }}
      title={title}
      description={description ?? `This action cannot be undone. Type "${itemName}" to confirm.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="destructive" disabled={!matches} loading={loading} onClick={handleConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <Input
        autoFocus
        placeholder={itemName}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Modal>
  );
}
