'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { deleteTransaction } from './actions';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteTransactionButtonProps {
  transactionId: string;
}

export function DeleteTransactionButton({
  transactionId,
}: DeleteTransactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTransaction(transactionId);
        toast.success('Transacción eliminada exitosamente');
      } catch (error) {
        toast.error('Error al eliminar la transacción');
      }
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="w-8 h-8 rounded-full ml-auto"
        title="Eliminar transacción"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <ConfirmationDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Eliminar Transacción"
        description="¿Estás seguro que deseas eliminar esta transacción? Esta acción no se puede deshacer y los regalos volverán a estar disponibles."
        confirmText="Eliminar"
        onConfirm={handleDelete}
      />
    </>
  );
}
