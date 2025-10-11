import { useState } from 'react';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { PostCard } from './components/PostCard';
import { Search } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const allTags = ['all', 'activity', 'photography', 'creative', 'art', 'technology', 'travel', 'minimalism'];

const posts: Post[] = [
  {
    id: 1,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1519217651866-847339e674d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMGRlc2t8ZW58MXx8fHwxNzYwMDQxODgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['activity', 'workspace', 'minimalism']
  },
  {
    id: 2,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1654371404345-845d8aa147f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBtb2Rlcm4lMjBidWlsZGluZ3xlbnwxfHx8fDE3NjAwODM5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['research', 'activity']
  },
  {
    id: 3,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1699568542323-ff98aca8ea6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMGNvbG9yZnVsfGVufDF8fHx8MTc2MDAwODUyNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['publication']
  },
  {
    id: 4,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1635148040718-acf281233b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjBtb3VudGFpbnxlbnwxfHx8fDE3NjAwMDQ4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['project']
  },
  {
    id: 5,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1569396116180-7fe09fa16dd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29kaW5nJTIwc2NyZWVufGVufDF8fHx8MTc2MDA5NDU1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['conference', 'publication']
  },
  {
    id: 6,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1749137011209-3c9127870785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZGVzaWduJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYwMTAzNjM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['activity', 'festival']
  },
  {
    id: 7,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1722689763859-61b3bfae87c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHklMjBzdHlsZWR8ZW58MXx8fHwxNzYwMTAzNjM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['publication', 'activity']
  },
  {
    id: 8,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1565560665589-37da0a389949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBjaXR5JTIwc3RyZWV0fGVufDF8fHx8MTc2MDEwMzYzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['conference', 'activity']
  },
  {
    id: 9,
    title: 'Lorem ipsum',
    description: 'Fusce posuere, augue a tempus cursus, felis purus dapibus nisi, ac scelerisque diam sapien in magna. Pellentesque blandit eros erat, id interdum lorem cursus in.',
    imageUrl: 'https://images.unsplash.com/photo-1709247505449-2621814603e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGNyZWF0aXZlJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzYwMTAzNjM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['project']
  }
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Logo */}
      <div className="flex flex-col items-center justify-center pt-20 pb-12 px-6 bg-gradient-to-b from-white to-gray-900">
        <div className="mb-12">
          <h1 className="text-6xl text-center text-black tracking-tight">SHAMIR</h1>
          <p className="text-center text-gray-500 mt-2">Creative Portfolio</p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full border-gray-300"
            />
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer capitalize px-4 py-1.5 hover:bg-black hover:text-white transition-colors"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              title={post.title}
              description={post.description}
              imageUrl={post.imageUrl}
              tags={post.tags}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No posts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
