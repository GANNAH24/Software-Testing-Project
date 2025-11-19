// Overwritten with Option1 LoadingSkeleton variant (simplified, no external Skeleton dependency)
import React from 'react';

function Skeleton({ className }) {
	return <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`}></div>;
}

export function LoadingSkeleton({ variant = 'card', count = 1 }) {
	if (variant === 'card') {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<div className="flex items-start gap-4">
					<Skeleton className="w-16 h-16 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</div>
				<div className="mt-4 pt-4 border-t border-gray-100">
					<Skeleton className="h-4 w-full" />
				</div>
			</div>
		);
	}

	if (variant === 'table') {
		return (
			<div className="space-y-3">
				{[...Array(count)].map((_, i) => (
					<div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
						<Skeleton className="h-10 w-10 rounded" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-3 w-1/2" />
						</div>
						<Skeleton className="h-8 w-24" />
					</div>
				))}
			</div>
		);
	}

	if (variant === 'form') {
		return (
			<div className="space-y-6">
				{[...Array(count)].map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
			</div>
		);
	}

	if (variant === 'list') {
		return (
			<div className="space-y-4">
				{[...Array(count)].map((_, i) => (
					<div key={i} className="flex items-center gap-3">
						<Skeleton className="h-12 w-12 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return null;
}

export default LoadingSkeleton;
