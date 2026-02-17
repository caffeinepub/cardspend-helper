import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomCategoriesManager from '@/components/settings/CustomCategoriesManager';
import CategoryMappingsEditor from '@/components/settings/CategoryMappingsEditor';
import CsvMappingEditor from '@/components/settings/CsvMappingEditor';

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure categories, mappings, and CSV import settings
        </p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Custom Categories</TabsTrigger>
          <TabsTrigger value="mappings">Category Mappings</TabsTrigger>
          <TabsTrigger value="csv">CSV Column Mapping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="mt-6">
          <CustomCategoriesManager />
        </TabsContent>
        
        <TabsContent value="mappings" className="mt-6">
          <CategoryMappingsEditor />
        </TabsContent>
        
        <TabsContent value="csv" className="mt-6">
          <CsvMappingEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
