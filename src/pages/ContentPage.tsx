import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen gradient-nebula">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading mb-4 text-gradient-rose">Content Unavailable</h1>
          <p className="text-foreground/70 mb-8">The dynamic content system has been disabled as the backend has been removed.</p>
          <Link to="/">
            <Button className="btn-cosmic">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
