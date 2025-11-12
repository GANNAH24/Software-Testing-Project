const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  API_VERSION: process.env.REACT_APP_API_VERSION || 'v1',
  TIMEOUT: 30000,
  
  get API_URL() {
    return `${this.BASE_URL}/api/${this.API_VERSION}`;
  }
};

export default API_CONFIG;
