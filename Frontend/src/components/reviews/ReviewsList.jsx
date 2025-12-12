import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import reviewsService from '../../shared/services/reviews.service';

export function ReviewsList({ doctorId }) {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, [doctorId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsService.getDoctorReviews(doctorId);
            const data = response?.data || response;

            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setReviewCount(data.reviewCount || 0);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#667eea]" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviewCount > 0 && (
                <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                    </div>
                </div>
            )}

            {reviews.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No reviews yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <Card key={review.review_id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {review.patients?.fullName || 'Anonymous'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                {review.comment && (
                                    <p className="text-gray-700 mt-2">{review.comment}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
