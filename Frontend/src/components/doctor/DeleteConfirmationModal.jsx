import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

/**
 * DeleteConfirmationModal Component
 * Confirmation dialog for delete operations
 * 
 * @param {boolean} open - Controls modal visibility
 * @param {function} onOpenChange - Callback when modal open state changes
 * @param {function} onConfirm - Callback when user confirms deletion
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {boolean} loading - Loading state during deletion
 */
export function DeleteConfirmationModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title = "Confirm Delete",
  message = "Are you sure you want to remove this slot? This action cannot be undone.",
  loading = false 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-gray-100 flex-1 sm:flex-initial"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Deleting...
              </>
            ) : (
              'Yes, Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
