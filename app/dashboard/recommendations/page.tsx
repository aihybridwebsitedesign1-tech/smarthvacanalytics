'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lightbulb, TrendingUp, Clock, Users, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

const CATEGORY_ICONS = {
  efficiency: Clock,
  profitability: TrendingUp,
  scheduling: Clock,
  training: Users,
};

const PRIORITY_COLORS = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
} as const;

export default function RecommendationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callFormData, setCallFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (!user) return;

    const fetchRecommendations = async () => {
      const { data } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setRecommendations(data);
      }

      setLoading(false);
    };

    fetchRecommendations();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;

    try {
      const client: any = supabase;
      await client
        .from('recommendations')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, is_read: true } : rec))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleBookCall = async () => {
    if (!user || !callFormData.name || !callFormData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const client: any = supabase;
      const { error } = await client
        .from('consultation_requests')
        .insert({
          name: callFormData.name,
          email: callFormData.email,
          company: '',
          user_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Call request submitted!',
        description: 'Our team will contact you within 24 hours.',
      });
      setShowCallModal(false);
      setCallFormData({ name: '', email: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold">Recommendations</h2>
          <p className="text-muted-foreground">AI-powered insights to optimize your business</p>
        </div>
        <Button onClick={() => setShowCallModal(true)}>
          Book Free Optimization Call
        </Button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const Icon = CATEGORY_ICONS[rec.category as keyof typeof CATEGORY_ICONS] || Lightbulb;
          const priorityColor = PRIORITY_COLORS[rec.priority as keyof typeof PRIORITY_COLORS] || 'default';

          return (
            <Card key={rec.id} className={rec.is_read ? 'opacity-75' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{rec.title}</CardTitle>
                        <Badge variant={priorityColor}>{rec.priority}</Badge>
                        {rec.is_read && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Read
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">
                        {rec.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!rec.is_read && (
                  <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(rec.id)}>
                    Mark as Read
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {recommendations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No recommendations yet</p>
              <p className="text-muted-foreground text-center">
                Keep tracking your jobs and we&apos;ll generate insights to help you grow.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Your Free Optimization Call</DialogTitle>
            <DialogDescription>
              We'll analyze your KPIs and show how to optimize your business to save time and increase profits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={callFormData.name}
                onChange={(e) => setCallFormData({ ...callFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={callFormData.email}
                onChange={(e) => setCallFormData({ ...callFormData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookCall}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
