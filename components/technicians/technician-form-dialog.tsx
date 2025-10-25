'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TechnicianFormData {
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface TechnicianFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTechnician?: any;
}

export function TechnicianFormDialog({ open, onClose, onSuccess, editTechnician }: TechnicianFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TechnicianFormData>({
    name: '',
    email: '',
    phone: '',
    status: 'active',
  });

  useEffect(() => {
    if (editTechnician) {
      setFormData({
        name: editTechnician.name || '',
        email: editTechnician.email || '',
        phone: editTechnician.phone || '',
        status: editTechnician.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'active',
      });
    }
  }, [editTechnician]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const techData = {
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
      };

      if (editTechnician) {
        const client: any = supabase;
        const { error } = await client
          .from('technicians')
          .update(techData)
          .eq('id', editTechnician.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: 'Technician updated',
          description: 'Technician has been updated successfully.',
        });
      } else {
        const client: any = supabase;
        const { error } = await client.from('technicians').insert(techData);

        if (error) throw error;

        toast({
          title: 'Technician added',
          description: 'New technician has been added successfully.',
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editTechnician ? 'Edit Technician' : 'Add New Technician'}</DialogTitle>
          <DialogDescription>
            {editTechnician ? 'Update technician details' : 'Fill in the details for the new technician'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTechnician ? 'Update Technician' : 'Add Technician'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
