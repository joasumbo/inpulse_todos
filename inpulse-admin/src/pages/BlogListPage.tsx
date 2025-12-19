import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/supabase';
import { Plus, Edit, Eye, EyeOff, Loader } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

export function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setLoading(false);
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ 
        is_published: !post.is_published,
        published_at: !post.is_published ? new Date().toISOString() : null
      })
      .eq('id', post.id);

    if (!error) {
      setPosts(posts.map(p => p.id === post.id ? { ...p, is_published: !p.is_published } : p));
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;
    
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    
    if (!error) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">{posts.length} posts publicados</p>
        <Link
          to="/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Novo Post
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                {post.category && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {post.category}
                  </span>
                )}
                <button
                  onClick={() => togglePublish(post)}
                  className={`text-xs px-2 py-1 rounded ${
                    post.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {post.is_published ? 'Publicado' : 'Rascunho'}
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
              {post.excerpt && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
              )}
              <div className="flex gap-2">
                <Link
                  to={`/blog/${post.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  <Edit size={16} />
                  Editar
                </Link>
                <button
                  onClick={() => deletePost(post.id)}
                  className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">Nenhum post criado ainda</p>
          <Link
            to="/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Criar Primeiro Post
          </Link>
        </div>
      )}
    </div>
  );
}
