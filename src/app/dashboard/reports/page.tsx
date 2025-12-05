'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LineChart, SlidersHorizontal, TableIcon } from 'lucide-react';
import {
  reportEntities,
  type ReportEntityKey,
} from '@/lib/report-definitions';
import { useReportData } from '@/firebase/firestore/reports';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const [selectedEntity, setSelectedEntity] = useState<ReportEntityKey | null>(null);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [reportParams, setReportParams] = useState<{ entity: ReportEntityKey; fields: string[] } | null>(null);

  const { data, loading } = useReportData(reportParams?.entity, reportParams?.fields);

  const handleEntityChange = (value: string) => {
    const entityKey = value as ReportEntityKey;
    setSelectedEntity(entityKey);
    // Reset and pre-select all fields for the new entity
    const newSelectedFields: Record<string, boolean> = {};
    reportEntities[entityKey].fields.forEach((field) => {
      newSelectedFields[field.key] = true;
    });
    setSelectedFields(newSelectedFields);
    setReportParams(null); // Reset report when entity changes
  };

  const handleFieldChange = (fieldKey: string, checked: boolean) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldKey]: checked,
    }));
  };

  const generateReport = () => {
    if (!selectedEntity) return;
    const fieldsToFetch = Object.entries(selectedFields)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => key);
    
    if (fieldsToFetch.length === 0) {
      // Or show a toast message
      alert("Выберите хотя бы одно поле для отчета.");
      return;
    }

    setReportParams({ entity: selectedEntity, fields: fieldsToFetch });
  };
  
  const getDisplayValue = (item: any, fieldKey: string): string => {
    const value = item[fieldKey];
    if (value === null || value === undefined) return 'N/A';
    if (fieldKey.toLowerCase().includes('date')) {
        try {
            return new Date(value).toLocaleDateString('ru-RU');
        } catch {
            return value;
        }
    }
    if (typeof value === 'number') {
        return new Intl.NumberFormat('ru-RU').format(value);
    }
    return String(value);
  }

  const currentEntityFields = selectedEntity ? reportEntities[selectedEntity].fields : [];

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Отчеты</h1>
          <p className="text-muted-foreground">
            Создание и экспорт пользовательских отчетов.
          </p>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Конструктор отчетов
          </CardTitle>
          <CardDescription>
            Выберите данные, укажите поля и сформируйте отчет.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>1. Выберите сущность</Label>
              <Select onValueChange={handleEntityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите данные для отчета" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(reportEntities).map((entity) => (
                    <SelectItem key={entity.key} value={entity.key}>
                      {entity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedEntity && (
              <div className="space-y-2 md:col-span-2">
                <Label>2. Выберите поля для отчета</Label>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {currentEntityFields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2">
                        <Checkbox
                          id={`field-${field.key}`}
                          checked={!!selectedFields[field.key]}
                          onCheckedChange={(checked) =>
                            handleFieldChange(field.key, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`field-${field.key}`}
                          className="font-normal"
                        >
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
          {selectedEntity && (
            <div className="flex justify-end">
              <Button onClick={generateReport}>Сформировать отчет</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {reportParams && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Результаты отчета
            </CardTitle>
            <CardDescription>
                Данные по сущности: "{reportEntities[reportParams.entity].label}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            {reportParams.fields.map(fieldKey => (
                                <TableHead key={fieldKey}><Skeleton className="h-5 w-24" /></TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {reportParams.fields.map(fieldKey => (
                                    <TableCell key={fieldKey}><Skeleton className="h-5 w-full" /></TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            ) : data && data.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            {reportParams.fields.map(fieldKey => (
                                <TableHead key={fieldKey}>{reportEntities[reportParams.entity].fields.find(f => f.key === fieldKey)?.label || fieldKey}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(item => (
                            <TableRow key={item.id}>
                                {reportParams.fields.map(fieldKey => (
                                    <TableCell key={fieldKey}>{getDisplayValue(item, fieldKey)}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <LineChart className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Данных не найдено</h3>
                <p className="text-muted-foreground mt-2">
                  По вашему запросу не найдено ни одной записи.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}