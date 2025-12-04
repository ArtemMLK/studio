import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, PlusCircle } from "lucide-react";

export default function BranchesPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Филиалы</h1>
          <p className="text-muted-foreground">
            Управление филиалами и объектами.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Добавить филиал
          </Button>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список филиалов</CardTitle>
          <CardDescription>Все зарегистрированные филиалы и объекты.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Филиалов пока нет</h3>
            <p className="text-muted-foreground mt-2">
              Добавьте первый филиал, чтобы начать работу.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
