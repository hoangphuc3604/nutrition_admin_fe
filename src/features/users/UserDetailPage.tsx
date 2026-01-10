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
import { useTranslation } from 'react-i18next';

export function UserDetailPage() {
  const { t } = useTranslation();
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
      <AdminLayout title={t('users.userDetail.title')}>
        <Card className="shadow-sm">
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">{t('users.userDetail.loading')}</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title={t('users.userDetail.title')}>
        <Card className="shadow-sm">
          <CardContent className="py-8">
            <p className="text-center text-sm text-destructive">
              {t('users.userDetail.loadFailed')}
            </p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={() => navigate('/users')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('users.userDetail.backToUsers')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  const { user, profile, stats, counts } = data;

  return (
    <AdminLayout title={t('users.userDetail.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('users.userDetail.backToUsers')}
          </Button>
          {isAdmin && (
            <Button variant="default" onClick={handleEditRoles}>
              <Shield className="h-4 w-4 mr-2" />
              {t('users.userDetail.editRoles')}
            </Button>
          )}
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('users.userDetail.userInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.userId')}</p>
                <p className="text-sm font-medium">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.email')}</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.status')}</p>
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
                <p className="text-sm text-muted-foreground mb-1">{t('users.userDetail.fields.roles')}</p>
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
                <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.emailVerified')}</p>
                <Badge variant={user.isEmailVerified ? "default" : "secondary"}>
                  {user.isEmailVerified ? t('users.userDetail.values.verified') : t('users.userDetail.values.notVerified')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.surveyCompleted')}</p>
                <Badge variant={user.doneSurvey ? "default" : "secondary"}>
                  {user.doneSurvey ? t('users.userDetail.values.yes') : t('users.userDetail.values.no')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.createdAt')}</p>
                <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.updatedAt')}</p>
                <p className="text-sm font-medium">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {profile && (
          <>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{t('users.userDetail.profileInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.age')}</p>
                    <p className="text-sm font-medium">{profile.age || t('users.userDetail.values.na')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.height')}</p>
                    <p className="text-sm font-medium">{profile.height ? `${profile.height} cm` : t('users.userDetail.values.na')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.weight')}</p>
                    <p className="text-sm font-medium">{profile.weight ? `${profile.weight} kg` : t('users.userDetail.values.na')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.targetWeight')}</p>
                    <p className="text-sm font-medium">{profile.target_weight ? `${profile.target_weight} kg` : t('users.userDetail.values.na')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.activityLevel')}</p>
                    <p className="text-sm font-medium capitalize">{profile.activity_level?.replace('_', ' ') || t('users.userDetail.values.na')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.healthGoal')}</p>
                    <p className="text-sm font-medium capitalize">{profile.health_goal?.replace('_', ' ') || t('users.userDetail.values.na')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('users.userDetail.fields.dailyCalorieTarget')}</p>
                    <p className="text-sm font-medium">{profile.daily_calorie_target ? `${profile.daily_calorie_target} kcal` : t('users.userDetail.values.na')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{t('users.userDetail.dietaryInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('users.userDetail.fields.allergies')}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies && profile.allergies.length > 0 ? (
                      profile.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline">{allergy}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('users.userDetail.values.none')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('users.userDetail.fields.medicalConditions')}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.medical_conditions && profile.medical_conditions.length > 0 ? (
                      profile.medical_conditions.map((condition, index) => (
                        <Badge key={index} variant="outline">{condition}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('users.userDetail.values.none')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('users.userDetail.fields.dietaryRestrictions')}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 ? (
                      profile.dietary_restrictions.map((restriction, index) => (
                        <Badge key={index} variant="outline">{restriction}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('users.userDetail.values.none')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('users.userDetail.fields.dietaryPreferences')}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.dietary_preferences && profile.dietary_preferences.length > 0 ? (
                      profile.dietary_preferences.map((preference, index) => (
                        <Badge key={index} variant="outline">{preference}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('users.userDetail.values.none')}</p>
                    )}
                  </div>
                </div>
                {profile.preferences && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t('users.userDetail.fields.dietaryPreferences')}</p>
                    <div className="space-y-2">
                      {profile.preferences.cuisines && profile.preferences.cuisines.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">{t('users.userDetail.fields.cuisines')}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.preferences.cuisines.map((cuisine, index) => (
                              <Badge key={index} variant="secondary">{cuisine}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('users.userDetail.fields.spiceLevel')}</p>
                          <p className="text-sm font-medium">{profile.preferences.spiceLevel || t('users.userDetail.values.na')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('users.userDetail.fields.cookingTime')}</p>
                          <p className="text-sm font-medium">{profile.preferences.cookingTime ? `${profile.preferences.cookingTime} min` : t('users.userDetail.values.na')}</p>
                        </div>
                      </div>
                      {profile.preferences.mealTypes && profile.preferences.mealTypes.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">{t('users.userDetail.fields.mealTypes')}</p>
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
            <CardTitle className="text-2xl font-bold">{t('users.userDetail.statistics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.stats.completedMeals')}</p>
                <p className="text-2xl font-bold">{stats.completedMeals}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.stats.likedMeals')}</p>
                <p className="text-2xl font-bold">{stats.likedMeals}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.stats.daysUsingApp')}</p>
                <p className="text-2xl font-bold">{stats.daysUsingApp}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.stats.totalMealPlans')}</p>
                <p className="text-2xl font-bold">{counts.totalMealPlans}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('users.userDetail.stats.fridgeItems')}</p>
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

