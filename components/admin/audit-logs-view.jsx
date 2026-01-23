"use client";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, ChevronLeft, ChevronRight, User } from "lucide-react";
import { format } from "date-fns";
const actionTypeColors = {
    USER_ACTIVATED: "bg-emerald-500/10 text-emerald-500 border-0",
    USER_DEACTIVATED: "bg-amber-500/10 text-amber-500 border-0",
    USER_DELETED: "bg-red-500/10 text-red-500 border-0",
    DOCTOR_VERIFIED: "bg-blue-500/10 text-blue-500 border-0",
    DOCTOR_BLOCKED: "bg-red-500/10 text-red-500 border-0",
    DOCTOR_UNBLOCKED: "bg-emerald-500/10 text-emerald-500 border-0",
    DOCTOR_PROFILE_UPDATED: "bg-violet-500/10 text-violet-500 border-0",
    DIAGNOSIS_FLAGGED: "bg-orange-500/10 text-orange-500 border-0",
    DIAGNOSIS_UNFLAGGED: "bg-emerald-500/10 text-emerald-500 border-0",
    APPOINTMENT_STATUS_UPDATED: "bg-blue-500/10 text-blue-500 border-0",
};
export function AuditLogsView({ logs, total, page, totalPages }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const updateFilters = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        }
        else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`/admin/audit-logs?${params.toString()}`);
    };
    const goToPage = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/admin/audit-logs?${params.toString()}`);
    };
    return (<div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">{total} total logs</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Select defaultValue={searchParams.get("targetType") || "all"} onValueChange={(value) => updateFilters("targetType", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Target Type"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Targets</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="appointment">Appointments</SelectItem>
                  <SelectItem value="prediction">Diagnoses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <FileText className="w-5 h-5 text-violet-500"/>
              Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (<TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-500/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-violet-500"/>
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{log.admin_name || "System"}</p>
                          <p className="text-xs text-muted-foreground">{log.admin_email || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${actionTypeColors[log.action_type] || "bg-muted text-muted-foreground"} border-0`}>
                        {log.action_type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-muted-foreground">{log.target_type}</span>
                        {log.target_id && <span className="text-muted-foreground opacity-60 ml-1">#{log.target_id}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-[300px] truncate">{log.description}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
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
    </div>);
}
