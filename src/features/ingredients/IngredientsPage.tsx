import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockIngredients = [
  { id: '1', name: 'Chicken Breast', category: 'Protein', unit: 'gram', caloriesPerUnit: 1.65 },
  { id: '2', name: 'Brown Rice', category: 'Grains', unit: 'gram', caloriesPerUnit: 1.11 },
  { id: '3', name: 'Broccoli', category: 'Vegetables', unit: 'gram', caloriesPerUnit: 0.34 },
  { id: '4', name: 'Olive Oil', category: 'Oils', unit: 'tbsp', caloriesPerUnit: 119 },
  { id: '5', name: 'Salmon', category: 'Protein', unit: 'gram', caloriesPerUnit: 2.08 },
  { id: '6', name: 'Avocado', category: 'Fruits', unit: 'piece', caloriesPerUnit: 234 },
];

export function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredIngredients = mockIngredients.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AdminLayout title="Ingredients">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold">Ingredient Management</CardTitle>
          <Button className="gap-2"><Plus className="h-4 w-4" />Add Ingredient</Button>
        </CardHeader>
        <CardContent>
          <div className="relative w-72 mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ingredients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Unit</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Calories/Unit</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-4 px-4 text-sm font-medium">{item.name}</td>
                  <td className="py-4 px-4"><Badge variant="secondary">{item.category}</Badge></td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{item.unit}</td>
                  <td className="py-4 px-4 text-sm">{item.caloriesPerUnit} kcal</td>
                  <td className="py-4 px-4 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
