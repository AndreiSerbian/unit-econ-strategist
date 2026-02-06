import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Image, Type } from "lucide-react";
import type { TextModel, ImageModel } from "@/hooks/useTokenEconomics";

interface ModelsTableProps {
  textModels: TextModel[];
  imageModels: ImageModel[];
  currency: string;
}

export function ModelsTable({ textModels, imageModels, currency }: ModelsTableProps) {
  const hasTextModels = textModels.length > 0;
  const hasImageModels = imageModels.length > 0;

  if (!hasTextModels && !hasImageModels) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Модели не загружены. Нажмите "Загрузить модели".</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="w-4 h-4 text-primary" />
          Каталог моделей и цен
        </CardTitle>
        <CardDescription>
          Текстовые и графические модели с ценами API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text">
          <TabsList className="mb-4">
            <TabsTrigger value="text" className="gap-1">
              <Type className="w-3 h-3" />
              Text ({textModels.length})
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1">
              <Image className="w-3 h-3" />
              Image ({imageModels.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Input/1M</TableHead>
                  <TableHead className="text-right">Cached/1M</TableHead>
                  <TableHead className="text-right">Output/1M</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {textModels.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">{m.providerName}</TableCell>
                    <TableCell className="text-xs font-medium">{m.modelName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {m.modeOrVariant}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      ${m.pricing?.priceIn1m.toFixed(2) || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {m.pricing?.priceCachedIn1m ? `$${m.pricing.priceCachedIn1m.toFixed(3)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      ${m.pricing?.priceOut1m.toFixed(2) || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="image" className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">$/Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imageModels.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">{m.providerName}</TableCell>
                    <TableCell className="text-xs font-medium">{m.modelName}</TableCell>
                    <TableCell className="text-xs">{m.modeOrVariant}</TableCell>
                    <TableCell>
                      <Badge
                        variant={m.modelClass === "image_premium" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {m.modelClass}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      ${m.pricing?.pricePerImage.toFixed(3) || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
