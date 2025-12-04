import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ApplicationsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Заявки</h1>
          <p className="text-muted-foreground">
            Просмотр и обработка заявок участников.
          </p>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список заявок</CardTitle>
          <CardDescription>Заявки участников на лоты.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Заявок пока нет</h3>
            <p className="text-muted-foreground mt-2">
              Здесь будут отображаться заявки от участников.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
