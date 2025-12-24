import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserDetail, useUpdateUserRoles } from '@/api/users.api';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { UserRole, getRoleVariant } from '@/enum/role.enum';
import { EditUserRolesDialog } from './components/EditUserRolesDialog';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useUserDetail(id || '');
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const updateUserRolesMutation = useUpdateUserRoles();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditRoles = () => {
    setIsEditingRoles(true);
  };

  const handleSaveRoles = async (userId: string, roles: UserRole[]) => {
    await updateUserRolesMutation.mutateAsync({ id: userId, roles });
  };


  if (isLoading) {
    return (
      <AdminLayout title="User Details">
        <Card className="shadow-sm">
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">Loading user details...</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title="User Details">
        <Card className="shadow-sm">
          <CardContent className="py-8">
            <p className="text-center text-sm text-destructive">
              Failed to load user details. Please try again.
            </p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={() => navigate('/users')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  const { user, profile, stats, counts } = data;

  return (
    <AdminLayout title="User Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          {isAdmin && (
            <Button variant="default" onClick={handleEditRoles}>
              <Shield className="h-4 w-4 mr-2" />
              Edit Roles
            </Button>
          )}
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-sm font-medium">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={cn(
                  "capitalize",
                  user.status === 'active' 
                    ? "bg-success/10 text-success hover:bg-success/20" 
                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                )}>
                  {user.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Roles</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant={getRoleVariant(role)}
                        className="capitalize"
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="capitalize">user</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email Verified</p>
                <Badge variant={user.isEmailVerified ? "default" : "secondary"}>
                  {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Survey Completed</p>
                <Badge variant={user.doneSurvey ? "default" : "secondary"}>
                  {user.doneSurvey ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="text-sm font-medium">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {profile && (
          <>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="text-sm font-medium">{profile.age || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="text-sm font-medium">{profile.height ? `${profile.height} cm` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="text-sm font-medium">{profile.weight ? `${profile.weight} kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Weight</p>
                    <p className="text-sm font-medium">{profile.target_weight ? `${profile.target_weight} kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Activity Level</p>
                    <p className="text-sm font-medium capitalize">{profile.activity_level?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Health Goal</p>
                    <p className="text-sm font-medium capitalize">{profile.health_goal?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Calorie Target</p>
                    <p className="text-sm font-medium">{profile.daily_calorie_target ? `${profile.daily_calorie_target} kcal` : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Dietary Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies && profile.allergies.length > 0 ? (
                      profile.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline">{allergy}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Medical Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.medical_conditions && profile.medical_conditions.length > 0 ? (
                      profile.medical_conditions.map((condition, index) => (
                        <Badge key={index} variant="outline">{condition}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Dietary Restrictions</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 ? (
                      profile.dietary_restrictions.map((restriction, index) => (
                        <Badge key={index} variant="outline">{restriction}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Dietary Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.dietary_preferences && profile.dietary_preferences.length > 0 ? (
                      profile.dietary_preferences.map((preference, index) => (
                        <Badge key={index} variant="outline">{preference}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
                {profile.preferences && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Preferences</p>
                    <div className="space-y-2">
                      {profile.preferences.cuisines && profile.preferences.cuisines.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Cuisines</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.preferences.cuisines.map((cuisine, index) => (
                              <Badge key={index} variant="secondary">{cuisine}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Spice Level</p>
                          <p className="text-sm font-medium">{profile.preferences.spiceLevel || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cooking Time</p>
                          <p className="text-sm font-medium">{profile.preferences.cookingTime ? `${profile.preferences.cookingTime} min` : 'N/A'}</p>
                        </div>
                      </div>
                      {profile.preferences.mealTypes && profile.preferences.mealTypes.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Meal Types</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.preferences.mealTypes.map((type, index) => (
                              <Badge key={index} variant="secondary">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Completed Meals</p>
                <p className="text-2xl font-bold">{stats.completedMeals}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Liked Meals</p>
                <p className="text-2xl font-bold">{stats.likedMeals}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Using App</p>
                <p className="text-2xl font-bold">{stats.daysUsingApp}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Meal Plans</p>
                <p className="text-2xl font-bold">{counts.totalMealPlans}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fridge Items</p>
                <p className="text-2xl font-bold">{counts.totalFridgeItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditingRoles && data && (
        <EditUserRolesDialog
          open={isEditingRoles}
          onOpenChange={setIsEditingRoles}
          userId={data.user.id}
          userEmail={data.user.email}
          currentRoles={data.user.roles && data.user.roles.length > 0 ? data.user.roles as UserRole[] : [UserRole.USER]}
          onSave={handleSaveRoles}
        />
      )}
    </AdminLayout>
  );
}

