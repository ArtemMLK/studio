import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function ReceiptsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Поступления</h1>
          <p className="text-muted-foreground">
            Просмотр и учет поступлений по лотам.
          </p>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список поступлений</CardTitle>
          <CardDescription>Денежные средства, полученные по заявкам.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Поступлений пока нет</h3>
            <p className="text-muted-foreground mt-2">
              Здесь будут отображаться все финансовые поступления.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
