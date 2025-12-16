// General helper functions
export const helpers = {
  generateId: () => Math.random().toString(36).substring(2, 15),
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  debounce: (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  truncate: (str, length = 50) => str?.length > length ? str.substring(0, length) + '...' : str,
  capitalize: (str) => str?.charAt(0).toUpperCase() + str.slice(1)
};
export default helpers;
