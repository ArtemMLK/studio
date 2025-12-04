import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ShoppingBasket } from "lucide-react";

export default function ProcurementsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Закупки</h1>
          <p className="text-muted-foreground">
            Управление процессами закупок.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Новая закупка
          </Button>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Активные закупки</CardTitle>
          <CardDescription>Список всех текущих закупочных процедур.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <ShoppingBasket className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Закупок пока нет</h3>
            <p className="text-muted-foreground mt-2">
              Начните с создания новой закупочной процедуры.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
