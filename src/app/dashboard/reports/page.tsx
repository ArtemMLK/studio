import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, SlidersHorizontal, FileDown } from "lucide-react";

export default function ReportsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Отчеты</h1>
          <p className="text-muted-foreground">
            Создание и экспорт пользовательских отчетов.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Экспорт
          </Button>
          <Button>
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Конструктор
          </Button>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Конструктор отчетов</CardTitle>
          <CardDescription>Здесь будет ваш отчет.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <LineChart className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Отчет не сформирован</h3>
            <p className="text-muted-foreground mt-2">
              Используйте конструктор для создания нового отчета.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
