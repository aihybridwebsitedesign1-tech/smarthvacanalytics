'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Technician {
  id: string;
  name: string;
}

interface JobFormData {
  title: string;
  client_name: string;
  client_address: string;
  job_date: string;
  scheduled_date: string;
  completed_date: string;
  hours_spent: string;
  revenue: string;
  cost: string;
  status: string;
  technician_id: string;
  notes: string;
  job_type: string;
  callback_required: boolean;
}

interface JobFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editJob?: any;
}

export function JobFormDialog({ open, onClose, onSuccess, editJob }: JobFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    client_name: '',
    client_address: '',
    job_date: new Date().toISOString().split('T')[0],
    scheduled_date: new Date().toISOString().split('T')[0],
    completed_date: '',
    hours_spent: '',
    revenue: '',
    cost: '',
    status: 'scheduled',
    technician_id: '',
    notes: '',
    job_type: 'repair',
    callback_required: false,
  });

  useEffect(() => {
    if (open && user) {
      fetchTechnicians();
    }
  }, [open, user]);

  useEffect(() => {
    if (editJob) {
      setFormData({
        title: editJob.title || '',
        client_name: editJob.client_name || '',
        client_address: editJob.client_address || '',
        job_date: editJob.job_date || '',
        scheduled_date: editJob.scheduled_date || editJob.job_date || '',
        completed_date: editJob.completed_date || '',
        hours_spent: editJob.hours_spent?.toString() || '',
        revenue: editJob.revenue?.toString() || '',
        cost: editJob.cost?.toString() || '',
        status: editJob.status || 'scheduled',
        technician_id: editJob.technician_id || '',
        notes: editJob.notes || '',
        job_type: editJob.job_type || 'repair',
        callback_required: editJob.callback_required || false,
      });
    } else {
      setFormData({
        title: '',
        client_name: '',
        client_address: '',
        job_date: new Date().toISOString().split('T')[0],
        scheduled_date: new Date().toISOString().split('T')[0],
        completed_date: '',
        hours_spent: '',
        revenue: '',
        cost: '',
        status: 'scheduled',
        technician_id: '',
        notes: '',
        job_type: 'repair',
        callback_required: false,
      });
    }
  }, [editJob]);

  const fetchTechnicians = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('technicians')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (data) {
      setTechnicians(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const revenue = parseFloat(formData.revenue) || 0;
      const cost = parseFloat(formData.cost) || 0;
      const grossMarginPercent = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;

      const jobData = {
        user_id: user.id,
        title: formData.title,
        client_name: formData.client_name,
        client_address: formData.client_address,
        job_date: formData.job_date,
        scheduled_date: formData.scheduled_date || formData.job_date,
        completed_date: formData.status === 'completed' ? (formData.completed_date || formData.job_date) : null,
        hours_spent: parseFloat(formData.hours_spent) || 0,
        revenue,
        cost,
        gross_margin_percent: grossMarginPercent,
        status: formData.status,
        technician_id: formData.technician_id || null,
        notes: formData.notes,
        job_type: formData.job_type,
        callback_required: formData.callback_required,
      };

      if (editJob) {
        const client: any = supabase;
        const { error } = await client
          .from('jobs')
          .update(jobData)
          .eq('id', editJob.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: 'Job updated',
          description: 'Job has been updated successfully.',
        });
      } else {
        const client: any = supabase;
        const { error } = await client.from('jobs').insert(jobData);

        if (error) throw error;

        toast({
          title: 'Job created',
          description: 'New job has been added successfully.',
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editJob ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          <DialogDescription>
            {editJob ? 'Update job details' : 'Fill in the details for the new job'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type *</Label>
                <Select value={formData.job_type} onValueChange={(v) => setFormData({ ...formData, job_type: v })} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="install">Install</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <TooltipProvider>
                  <div className="flex items-center space-x-2 pt-7">
                    <Checkbox
                      id="callback_required"
                      checked={formData.callback_required}
                      onCheckedChange={(checked) => setFormData({ ...formData, callback_required: checked as boolean })}
                      disabled={loading}
                    />
                    <Label htmlFor="callback_required" className="cursor-pointer flex items-center gap-2">
                      Callback Required
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Check if a return visit was needed to complete this job</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  </div>
                </TooltipProvider>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_date">Job Date *</Label>
                <Input
                  id="job_date"
                  type="date"
                  value={formData.job_date}
                  onChange={(e) => setFormData({ ...formData, job_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <Label htmlFor="scheduled_date" className="flex items-center gap-2">
                    Scheduled Date
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>When was this job originally scheduled?</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                </TooltipProvider>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  disabled={loading}
                />
              </div>
              {formData.status === 'completed' && (
                <div className="space-y-2">
                  <TooltipProvider>
                    <Label htmlFor="completed_date" className="flex items-center gap-2">
                      Completed Date
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>When was this job actually completed?</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  </TooltipProvider>
                  <Input
                    id="completed_date"
                    type="date"
                    value={formData.completed_date}
                    onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_address">Client Address</Label>
              <Input
                id="client_address"
                value={formData.client_address}
                onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician_id">Assigned Technician</Label>
              <Select value={formData.technician_id} onValueChange={(v) => setFormData({ ...formData, technician_id: v })} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours_spent">Hours Spent</Label>
                <Input
                  id="hours_spent"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hours_spent}
                  onChange={(e) => setFormData({ ...formData, hours_spent: e.target.value })}
                  disabled={loading}
                  placeholder="e.g., 2.48"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue ($)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            {formData.revenue && formData.cost && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calculated Gross Margin:</span>
                  <span className="font-semibold">
                    {(() => {
                      const revenue = parseFloat(formData.revenue) || 0;
                      const cost = parseFloat(formData.cost) || 0;
                      const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
                      return `${margin.toFixed(1)}%`;
                    })()}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editJob ? 'Update Job' : 'Create Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
