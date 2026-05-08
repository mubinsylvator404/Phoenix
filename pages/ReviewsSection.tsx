import React, { useState, useRef } from 'react';
import { Review, UserRole } from '../types';
import { Star, MessageSquare, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReviewsSectionProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  role: UserRole;
  currentUser: any;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, setReviews, role, currentUser }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userType, setUserType] = useState<'Student' | 'Guardian' | 'Other'>('Student');
  const [publicName, setPublicName] = useState('');
  const [hscBatch, setHscBatch] = useState('');
  const [studentName, setStudentName] = useState('');
  const [relation, setRelation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const finalName = currentUser?.name || publicName.trim() || 'Anonymous';

    setIsSubmitting(true);
    const newReview: Review = {
      id: crypto.randomUUID(),
      userName: finalName,
      userType,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      isApproved: role === UserRole.ADMIN, // Auto-approve if admin
      hscBatch: userType === 'Student' ? hscBatch : undefined,
      studentName: userType === 'Guardian' ? studentName : undefined,
      relation: userType === 'Guardian' ? relation : undefined,
    };

    setReviews(prev => [newReview, ...prev]);
    setComment('');
    setRating(5);
    setPublicName('');
    setHscBatch('');
    setStudentName('');
    setRelation('');
    setShowForm(false);
    setIsSubmitting(false);
    alert(role === UserRole.ADMIN ? 'Review published successfully!' : 'Review submitted for approval.');
  };

  const handleApprove = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved: true } : r));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Adjust as needed
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const visibleReviews = role === UserRole.ADMIN ? reviews : reviews.filter(r => r.isApproved);

  return (
    <section className="py-20 bg-[#000814] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
              <span className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase">
              Student & Guardian <span className="text-[#FFD700]">Reviews</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-[#FFD700] hover:bg-[#FFC107] text-[#000814] rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105"
            >
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white/5 p-6 sm:p-8 rounded-3xl border border-white/10 mb-12 backdrop-blur-xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">Leave your feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!currentUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={publicName}
                    onChange={(e) => setPublicName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#FFD700] text-white outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">I am a</label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#FFD700] text-white outline-none"
                >
                  <option value="Student">Student</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {userType === 'Student' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">HSC Batch</label>
                  <input
                    type="text"
                    value={hscBatch}
                    onChange={(e) => setHscBatch(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#FFD700] text-white outline-none"
                    placeholder="e.g. HSC 2024"
                  />
                </div>
              )}

              {userType === 'Guardian' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Student's Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#FFD700] text-white outline-none"
                      placeholder="Student's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Relation</label>
                    <input
                      type="text"
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#FFD700] text-white outline-none"
                      placeholder="e.g. Father, Mother"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 transition-colors ${star <= rating ? 'text-[#FFD700]' : 'text-slate-600'}`}
                    >
                      <Star className="w-8 h-8" fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#FFD700] text-white outline-none resize-none"
                  placeholder="Share your experience..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#FFD700] hover:bg-[#FFC107] text-[#000814] rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>
        )}

        {visibleReviews.length > 0 ? (
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {visibleReviews.map(review => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`min-w-[300px] sm:min-w-[400px] max-w-[400px] flex-shrink-0 snap-center bg-white/5 p-6 sm:p-8 rounded-3xl border ${!review.isApproved ? 'border-yellow-500/50' : 'border-white/10'} backdrop-blur-sm flex flex-col`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFD700]/10 rounded-full flex items-center justify-center text-[#FFD700]">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{review.userName}</h3>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">
                        {review.userType}
                        {review.userType === 'Student' && review.hscBatch && ` • ${review.hscBatch}`}
                        {review.userType === 'Guardian' && review.relation && review.studentName && ` • ${review.relation} of ${review.studentName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-[#FFD700]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 flex-grow">
                  "{review.comment}"
                </p>
                
                <div className="flex justify-between items-center text-xs text-slate-500 mt-auto pt-4 border-t border-white/10">
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  {!review.isApproved && <span className="text-yellow-500 font-medium uppercase tracking-widest">Pending</span>}
                </div>

                {role === UserRole.ADMIN && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="flex-1 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex-1 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No reviews yet</h3>
            <p className="text-slate-400">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
