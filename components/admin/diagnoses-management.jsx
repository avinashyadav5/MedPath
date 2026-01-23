"use client";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Search, Flag, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { flagDiagnosis, unflagDiagnosis } from "@/app/actions/admin-actions";
import { format } from "date-fns";
const urgencyColors = {
    low: "bg-emerald-500/10 text-emerald-500 border-0",
    medium: "bg-amber-500/10 text-amber-500 border-0",
    high: "bg-orange-500/10 text-orange-500 border-0",
    critical: "bg-red-500/10 text-red-500 border-0",
};
export function DiagnosesManagement({ diagnoses, total, page, totalPages }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [flagDialogOpen, setFlagDialogOpen] = useState(false);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [flagReason, setFlagReason] = useState("");
    const updateFilters = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        }
        else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`/admin/diagnoses?${params.toString()}`);
    };
    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters("search", search);
    };
    const handleFlag = async () => {
        if (!selectedDiagnosis || !flagReason.trim())
            return;
        startTransition(async () => {
            await flagDiagnosis(selectedDiagnosis.id, flagReason);
            setFlagDialogOpen(false);
            setSelectedDiagnosis(null);
            setFlagReason("");
        });
    };
    const handleUnflag = async (diagnosisId) => {
        startTransition(async () => {
            await unflagDiagnosis(diagnosisId);
        });
    };
    const goToPage = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/admin/diagnoses?${params.toString()}`);
    };
    const getRiskColor = (risk) => {
        if (risk >= 70)
            return "text-red-500 bg-red-500/10 border-0";
        if (risk >= 40)
            return "text-amber-500 bg-amber-500/10 border-0";
        return "text-emerald-500 bg-emerald-500/10 border-0";
    };
    return (<div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Diagnosis Monitoring</h1>
            <p className="text-muted-foreground mt-1">{total} total diagnoses</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                  <Input placeholder="Search diagnoses or symptoms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10"/>
                </div>
                <Button type="submit">Search</Button>
              </form>
              <Select defaultValue={searchParams.get("urgency") || "all"} onValueChange={(value) => updateFilters("urgency", value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Urgency"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={searchParams.get("flagged") || "all"} onValueChange={(value) => updateFilters("flagged", value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Flagged"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Flagged Only</SelectItem>
                  <SelectItem value="false">Not Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={searchParams.get("minRisk") || "all"} onValueChange={(value) => updateFilters("minRisk", value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Min Risk"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="40">40%+</SelectItem>
                  <SelectItem value="60">60%+</SelectItem>
                  <SelectItem value="80">80%+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Diagnoses Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Brain className="w-5 h-5 text-violet-500"/>
              AI Diagnoses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnoses.map((diag) => (<TableRow key={diag.id} className={diag.is_flagged ? "bg-amber-500/5" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">{diag.patient_name}</p>
                        <p className="text-sm text-muted-foreground">{diag.city}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground max-w-[200px] truncate">{diag.diagnosis}</p>
                        <p className="text-sm text-muted-foreground max-w-[200px] truncate">{diag.symptoms}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(diag.risk_percent)}>{diag.risk_percent}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={urgencyColors[diag.urgency] || "bg-muted text-muted-foreground border-0"}>
                        {diag.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(diag.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {diag.is_flagged ? (<div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-amber-500"/>
                          <span className="text-xs text-amber-500">Flagged</span>
                        </div>) : (<div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500"/>
                          <span className="text-xs text-emerald-500">OK</span>
                        </div>)}
                    </TableCell>
                    <TableCell className="text-right">
                      {diag.is_flagged ? (<Button variant="ghost" size="sm" onClick={() => handleUnflag(diag.id)} disabled={isPending} className="text-emerald-600 hover:text-emerald-700">
                          <CheckCircle className="w-4 h-4 mr-1"/>
                          Unflag
                        </Button>) : (<Button variant="ghost" size="sm" onClick={() => {
                    setSelectedDiagnosis(diag);
                    setFlagDialogOpen(true);
                }} className="text-orange-600 hover:text-orange-700">
                          <Flag className="w-4 h-4 mr-1"/>
                          Flag
                        </Button>)}
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (<div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                    <ChevronLeft className="w-4 h-4"/>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
                    <ChevronRight className="w-4 h-4"/>
                  </Button>
                </div>
              </div>)}
          </CardContent>
        </Card>
      </motion.div>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Diagnosis</DialogTitle>
            <DialogDescription>
              Please provide a reason for flagging this diagnosis. This will be logged for review.
            </DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Enter reason for flagging..." value={flagReason} onChange={(e) => setFlagReason(e.target.value)} className="min-h-[100px]"/>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFlag} disabled={!flagReason.trim() || isPending} className="bg-orange-600">
              Flag Diagnosis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
