import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Scale, Tag, Image, Thermometer, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIngredient } from '@/api/ingredients.api';
import { Loader2 } from 'lucide-react';

export function IngredientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: ingredient, isLoading, error } = useIngredient(id!);

  if (isLoading) {
    return (
      <AdminLayout title={t('ingredients.detailTitle')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t('ingredients.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !ingredient) {
    return (
      <AdminLayout title={t('ingredients.detailTitle')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">{t('ingredients.notFound')}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/ingredients')}
            >
              {t('ingredients.backToIngredients')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('ingredients.detailTitle')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ingredients')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('ingredients.backToIngredients')}
          </Button>
          <div className="flex-1" />
          <Button
            onClick={() => navigate(`/ingredients/${id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('ingredients.editIngredient')}
          </Button>
        </div>

        {/* Ingredient Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{ingredient.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {ingredient.category || 'Uncategorized'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Tag className="h-3.5 w-3.5" /> {t('ingredients.category')}
                  </Label>
                  <p className="text-foreground font-medium">{ingredient.category || t('ingredients.uncategorized')}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Scale className="h-3.5 w-3.5" /> {t('ingredients.unit')}
                  </Label>
                  <p className="text-foreground font-medium">{ingredient.common_unit || t('common.na')}</p>
                </div>
              </div>

              {/* Storage Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Thermometer className="h-3.5 w-3.5" /> {t('ingredients.storage')}
                  </Label>
                  <p className="text-foreground font-medium capitalize">
                    {ingredient.storage_temperature?.replace('_', ' ') || t('ingredients.roomTemp')}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5" /> {t('ingredients.shelfLife')}
                  </Label>
                  <p className="text-foreground font-medium">
                    {ingredient.shelf_life_days ? `${ingredient.shelf_life_days} ${t('common.days')}` : t('common.na')}
                  </p>
                </div>
              </div>

              {/* Image */}
              <div className="space-y-4">
                {ingredient.image_url && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                      <Image className="h-3.5 w-3.5" /> {t('ingredients.image')}
                    </Label>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={ingredient.image_url}
                        alt={ingredient.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {ingredient.description && (
              <div className="mt-6 pt-6 border-t border-border">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
                  Description
                </Label>
                <p className="text-foreground">{ingredient.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

// Helper component for labels
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
