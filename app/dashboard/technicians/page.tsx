'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TechnicianFormDialog } from '@/components/technicians/technician-form-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getMaxTechnicians } from '@/lib/plan-features';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Technician {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

interface TechnicianStats {
  id: string;
  name: string;
  jobsCompleted: number;
  totalRevenue: number;
  avgHours: number;
}

export default function TechniciansPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [techStats, setTechStats] = useState<TechnicianStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTechDialog, setShowTechDialog] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [deletingTechId, setDeletingTechId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchTechnicians();
    fetchTechnicianStats();
  }, [user]);

  const fetchTechnicians = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('technicians')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (data) {
      setTechnicians(data);
    }

    setLoading(false);
  };

  const fetchTechnicianStats = async () => {
    if (!user) return;

    const { data: techs } = await supabase
      .from('technicians')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!techs) return;

    const stats = await Promise.all(
      techs.map(async (tech: any) => {
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('technician_id', tech.id)
          .eq('status', 'completed');

        const jobsCompleted = jobs?.length || 0;
        const totalRevenue = jobs?.reduce((sum, job: any) => sum + Number(job.revenue), 0) || 0;
        const totalHours = jobs?.reduce((sum, job: any) => sum + Number(job.hours_spent), 0) || 0;
        const avgHours = jobsCompleted > 0 ? totalHours / jobsCompleted : 0;

        return {
          id: tech.id,
          name: tech.name,
          jobsCompleted,
          totalRevenue,
          avgHours,
        };
      })
    );

    setTechStats(stats);
  };

  const handleAddTechnician = () => {
    if (!profile) return;

    const maxTechs = getMaxTechnicians(profile.plan_tier);
    if (maxTechs !== null && technicians.length >= maxTechs) {
      setShowUpgradeModal(true);
      return;
    }

    setShowTechDialog(true);
  };

  const handleEdit = (tech: Technician) => {
    setEditingTech(tech);
    setShowTechDialog(true);
  };

  const handleDelete = async (techId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('technicians')
      .delete()
      .eq('id', techId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete technician',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Technician deleted',
        description: 'Technician has been removed successfully.',
      });
      fetchTechnicians();
      fetchTechnicianStats();
    }

    setDeletingTechId(null);
  };

  const handleDialogClose = () => {
    setShowTechDialog(false);
    setEditingTech(null);
  };

  const handleSuccess = () => {
    fetchTechnicians();
    fetchTechnicianStats();
  };

  const maxTechs = profile ? getMaxTechnicians(profile.plan_tier) : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold">Technicians</h2>
          <p className="text-muted-foreground">
            Manage your team and track performance
            {maxTechs !== null && ` (${technicians.length}/${maxTechs})`}
          </p>
        </div>
        <Button onClick={handleAddTechnician}>
          {maxTechs !== null && technicians.length >= maxTechs && <Lock className="mr-2 h-4 w-4" />}
          <Plus className="mr-2 h-4 w-4" />
          Add Technician
        </Button>
      </div>

      {techStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>Revenue by technician</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={techStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Jobs Completed</TableHead>
              <TableHead>Total Revenue</TableHead>
              <TableHead>Avg Hours/Job</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No technicians found. Add your first technician to get started.
                </TableCell>
              </TableRow>
            ) : (
              technicians.map((tech) => {
                const stats = techStats.find((s) => s.id === tech.id);
                return (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>{tech.email || '-'}</TableCell>
                    <TableCell>{tech.phone || '-'}</TableCell>
                    <TableCell>{stats?.jobsCompleted || 0}</TableCell>
                    <TableCell>${stats?.totalRevenue.toLocaleString() || 0}</TableCell>
                    <TableCell>{stats?.avgHours.toFixed(1) || 0}h</TableCell>
                    <TableCell>
                      <Badge variant={tech.status === 'active' ? 'default' : 'secondary'}>
                        {tech.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tech)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingTechId(tech.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TechnicianFormDialog
        open={showTechDialog}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
        editTechnician={editingTech}
      />

      <AlertDialog open={!!deletingTechId} onOpenChange={() => setDeletingTechId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Technician</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this technician? Their assigned jobs will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingTechId && handleDelete(deletingTechId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="More Technicians"
      />
    </div>
  );
}
