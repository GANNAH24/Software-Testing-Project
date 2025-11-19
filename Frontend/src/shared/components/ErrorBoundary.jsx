import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='bg-white p-8 rounded-lg shadow-md max-w-md text-center'>
            <h1 className='text-2xl font-bold text-red-600 mb-4'>Something went wrong</h1>
            <p className='text-gray-600 mb-4'>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button onClick={() => window.location.href = '/'} className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'>Go Home</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
