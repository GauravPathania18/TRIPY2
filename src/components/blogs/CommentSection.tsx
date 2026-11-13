import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Send } from 'lucide-react';
import { BlogComment } from '../../types';

interface CommentSectionProps {
  blogId: string;
  user: any | null;
  setTab: (tab: string) => void;
  onClose: () => void;
}

/** Comments list + add-comment form for a single blog (GET/POST /api/blogs/:id/comments). */
export default function CommentSection({ blogId, user, setTab, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchComments(blogId);
  }, [blogId]);

  const fetchComments = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setTab('login');
      return;
    }
    if (!newComment.trim() || !blogId) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({ comment: newComment })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setComments(prev => [...prev, data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to submit comment', err);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="pt-8 border-t border-gray-200 dark:border-white/5 space-y-6">
      <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-amber-500" />
        <span>Comments & Notes ({comments.length})</span>
      </h3>

      {/* List of comments */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono">No discussions posted. Be the first to share your travels!</p>
        ) : (
          comments.map((comm) => (
            <div key={comm.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" /> {comm.user_name}
                </span>
                <span>Now</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-light">{comm.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Write form */}
      {user ? (
        <form onSubmit={handlePostComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a travel insight..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-sm rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={commentLoading}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{commentLoading ? 'Posting...' : 'Post'}</span>
          </button>
        </form>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-xs text-slate-400">
          Please{' '}
          <button onClick={() => { onClose(); setTab('login'); }} className="text-amber-500 font-semibold hover:underline">
            Sign In
          </button>{' '}
          to join the travel discussions.
        </div>
      )}
    </div>
  );
}
