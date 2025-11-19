// Toast notification helper wrapping sonner
// Provides convenience functions for consistent toast usage across app.
import { toast } from 'sonner';

export const showToast = (message, options = {}) => toast(message, options);
export const showSuccess = (message, options = {}) => toast.success(message, options);
export const showError = (message, options = {}) => toast.error(message, options);
export const showInfo = (message, options = {}) => toast(message, { ...options, icon: 'ℹ' });
export const showPromise = (promise, { loading = 'Loading...', success = 'Done', error = 'Error' } = {}) =>
  toast.promise(promise, { loading, success, error });

const toastHelpers = {
  showToast,
  showSuccess,
  showError,
  showInfo,
  showPromise
};

export default toastHelpers;
