
"use client";
import { useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

export default function LoginPage() {
  const { login, mockUsers, currentUser } = useAppData();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const router = useRouter();

  if (currentUser) {
    // If user is already logged in, redirect them.
    // This logic can be more sophisticated, e.g., redirect to their specific dashboard.
    if (currentUser.role === 'admin') router.push('/');
    else if (currentUser.role === 'distributor') router.push('/distributor');
    else if (currentUser.role === 'store-owner') router.push('/store-user');
    else router.push('/');
    return null; // Return null while redirecting
  }

  const handleLogin = () => {
    if (selectedUserId) {
      login(selectedUserId);
      // AppDataContext's login function now handles redirection
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
            <LogIn className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>Select a profile to login to Laptop Trackr.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-select">Select User Profile</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select" className="w-full">
                <SelectValue placeholder="Choose a user to simulate login" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((user: User) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleLogin} className="w-full" disabled={!selectedUserId}>
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
