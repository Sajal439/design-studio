"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstimationResult } from "@/lib/estimator/types";
import { Download, Hammer, Package2, PhoneCall, Ruler, ShoppingBag, Truck } from "lucide-react";

interface EstimateResultProps {
  result: EstimationResult;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function EstimateResultDisplay({ result }: EstimateResultProps) {
  const customerRange = `${formatCurrency(result.summary.totalCostMin)} - ${formatCurrency(result.summary.totalCostMax)}`;
  const primaryCtaHref =
    result.nextBestAction.primary === "BOOK_SITE_VISIT"
      ? "/consultation"
      : result.nextBestAction.primary === "VIEW_PRODUCT_BUNDLE" && result.productRecommendations[0]
        ? `/quote?product=${result.productRecommendations[0].productSlug}`
        : "/quote?source=estimator";
  const primaryCtaLabel =
    result.nextBestAction.primary === "BOOK_SITE_VISIT"
      ? "Book Free Site Visit"
      : result.nextBestAction.primary === "VIEW_PRODUCT_BUNDLE"
        ? "Get Goel Traders Product Bundle"
        : "Request Exact Quote";

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-foreground/10 bg-[linear-gradient(135deg,rgba(27,29,31,0.98),rgba(62,46,31,0.96))] text-white shadow-[0_25px_80px_rgba(15,23,42,0.18)]">
        <div className="grid gap-6 px-6 py-6 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full bg-white/12 text-white hover:bg-white/12">{result.categoryLabel}</Badge>
              <Badge className="rounded-full bg-white/12 text-white hover:bg-white/12">{result.layout.replace(/_/g, " ")}</Badge>
              <Badge className="rounded-full bg-white/12 text-white hover:bg-white/12">{result.grade.toLowerCase()} grade</Badge>
              <Badge className="rounded-full bg-white/12 text-white hover:bg-white/12">{result.finishType.toLowerCase()} finish</Badge>
              <Badge className="rounded-full bg-white/12 text-white hover:bg-white/12">{result.doorType.toLowerCase()} doors</Badge>
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em]">{result.designTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                {result.dimensions.width} ft x {result.dimensions.height} ft x {result.dimensions.depth} ft
                {" "}configuration with a module-driven material estimate and customer-ready cost range.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-white/15 bg-white/6 text-white hover:bg-white/12 hover:text-white"
                onClick={() => window.print()}
              >
                <Download className="mr-2 h-4 w-4" />
                Print / Save PDF
              </Button>
              <Button size="sm" className="bg-white text-black hover:bg-white/90" asChild>
                <Link href={primaryCtaHref}>
                  <PhoneCall className="mr-2 h-4 w-4" />
                  {primaryCtaLabel}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Estimated price range", value: customerRange },
              { label: "Generated modules", value: `${result.modules.length}` },
              { label: "Sheet count", value: `${result.sheetOptimization.reduce((sum, item) => sum + item.sheetCount, 0)} sheets` },
              { label: "Material cost", value: formatCurrency(result.summary.materialCost) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{stat.label}</p>
                <p className="mt-2 text-lg font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Card className="border border-foreground/10 bg-[linear-gradient(180deg,rgba(249,247,242,0.86),rgba(255,255,255,1))]">
        <CardHeader>
          <CardTitle>Estimated project price</CardTitle>
          <CardDescription>
            This range includes materials, hardware, labor, installation, transport, and normal market fluctuation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-primary/25 bg-primary/6 p-5">
            <p className="text-sm text-muted-foreground">Customer estimate</p>
            <p className="mt-2 text-3xl font-semibold">{customerRange}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use this as the working budget range before a final site visit, finish selection, and exact execution quote.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-[1.25rem] bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Hardware & accessories</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(result.summary.hardwareCost)}</p>
            </div>
            <div className="rounded-[1.25rem] bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Labor & installation</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(result.summary.laborCost + result.summary.installationCost)}</p>
            </div>
            <div className="rounded-[1.25rem] bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Transport</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(result.summary.transportCost)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-foreground/10 bg-[linear-gradient(180deg,rgba(249,247,242,0.86),rgba(255,255,255,1))]">
        <CardHeader>
          <CardTitle>Goel Traders recommended products</CardTitle>
          <CardDescription>
            These recommendations are mapped directly from your BOM so customers can move from estimate to buying from Goel Traders faster.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.25rem] border border-primary/25 bg-primary/6 p-4">
            <p className="text-sm font-medium">Recommended next step</p>
            <p className="mt-2 text-lg font-semibold">{result.nextBestAction.primary.replace(/_/g, " ").toLowerCase()}</p>
            <p className="mt-2 text-sm text-muted-foreground">{result.nextBestAction.reason}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.productRecommendations.map((product) => (
              <div key={product.productSlug} className="rounded-[1.25rem] border border-foreground/10 bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{product.productName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">{Math.round(product.confidence * 100)}% match</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{product.reason}</p>
                <div className="mt-4 space-y-1 text-sm">
                  <p>Recommended qty: <span className="font-medium">{product.recommendedQty} {product.unit}</span></p>
                  <p>Price band: <span className="font-medium">{product.priceRange}</span></p>
                  <p>Mapped from: <span className="font-medium">{product.materialName}</span></p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/quote?product=${product.productSlug}`}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Request price
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/products/${product.productSlug}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Module plan
          </CardTitle>
          <CardDescription>
            Layout rule: {result.blueprint.layoutRule}. Finish: {result.blueprint.finishType.toLowerCase()}. Door system: {result.blueprint.doorType.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {result.modules.map((module) => (
            <div key={module.id} className="rounded-[1.25rem] border border-foreground/10 bg-[linear-gradient(180deg,rgba(249,247,242,0.75),rgba(255,255,255,1))] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{module.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {module.width} ft x {module.height} ft x {module.depth} ft
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">{module.type.replace(/_/g, " ")}</Badge>
              </div>
              {module.notes ? <p className="mt-3 text-xs text-muted-foreground">{module.notes}</p> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-foreground/10">
        <CardHeader>
          <CardTitle>Purchase-ready BOM list</CardTitle>
          <CardDescription>A compact bill of materials generated from the estimator pipeline.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {result.billOfMaterials.map((item) => (
            <div key={item} className="rounded-[1.25rem] border border-foreground/10 bg-muted/20 px-4 py-3 text-sm">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-foreground/10">
        <CardHeader>
          <CardTitle>Bill of materials</CardTitle>
          <CardDescription>Waste-adjusted quantities and estimated line-item costs for the customer estimate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Final qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Waste</TableHead>
                <TableHead>Unit cost</TableHead>
                <TableHead className="text-right">Est. cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.materials.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">
                    <div>{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.category.toLowerCase()}</div>
                  </TableCell>
                  <TableCell className="font-semibold">{item.finalQuantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.wastePercentage}%</TableCell>
                  <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.estimatedCost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Sheet optimization
            </CardTitle>
            <CardDescription>Cut panels are rolled up into practical sheet counts for purchase planning.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {result.sheetOptimization.map((item) => (
              <div key={item.materialName} className="rounded-[1.25rem] border border-foreground/10 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.materialName}</p>
                  <Badge variant="outline" className="rounded-full">{item.utilization}% use</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.panelCount} panels from {item.totalArea} sqft packed into {item.sheetCount} sheets.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="h-5 w-5" />
              Cost breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Material</span>
              <span className="font-medium">{formatCurrency(result.summary.materialCost)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hardware and accessories</span>
              <span className="font-medium">{formatCurrency(result.summary.hardwareCost)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Labor</span>
              <span className="font-medium">{formatCurrency(result.summary.laborCost)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Installation</span>
              <span className="font-medium">{formatCurrency(result.summary.installationCost)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                Transport
              </span>
              <span className="font-medium">{formatCurrency(result.summary.transportCost)}</span>
            </div>
            <Separator className="border-t-2" />
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold">Price range</span>
              <span className="text-lg font-semibold text-primary">{customerRange}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
