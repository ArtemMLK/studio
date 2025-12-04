import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCheck } from "lucide-react";

export default function AllocationsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Распределения</h1>
          <p className="text-muted-foreground">
            Просмотр и управление выдачей по заявкам.
          </p>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список распределений</CardTitle>
          <CardDescription>Выдача товаров или услуг по заявкам.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <PackageCheck className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Распределений пока нет</h3>
            <p className="text-muted-foreground mt-2">
              Здесь будут отображаться выданные участникам лоты.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
