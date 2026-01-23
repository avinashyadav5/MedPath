"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Stethoscope, Calendar, AlertTriangle, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
const statCards = [
    { key: "totalUsers", label: "Total Users", icon: Users, color: "bg-blue-500" },
    { key: "totalPatients", label: "Total Patients", icon: UserCheck, color: "bg-emerald-500" },
    { key: "totalDoctors", label: "Total Doctors", icon: Stethoscope, color: "bg-violet-500" },
    { key: "totalAppointments", label: "Appointments", icon: Calendar, color: "bg-amber-500" },
    { key: "highRiskCases", label: "High Risk Cases", icon: AlertTriangle, color: "bg-red-500" },
];
const actionTypeColors = {
    USER_ACTIVATED: "bg-emerald-500/10 text-emerald-500",
    USER_DEACTIVATED: "bg-amber-500/10 text-amber-500",
    USER_DELETED: "bg-red-500/10 text-red-500",
    DOCTOR_VERIFIED: "bg-blue-500/10 text-blue-500",
    DOCTOR_BLOCKED: "bg-red-500/10 text-red-500",
    DOCTOR_UNBLOCKED: "bg-emerald-500/10 text-emerald-500",
    DIAGNOSIS_FLAGGED: "bg-orange-500/10 text-orange-500",
    APPOINTMENT_STATUS_UPDATED: "bg-violet-500/10 text-violet-500",
};
export function AdminDashboardContent({ stats, recentActivity }) {
    return (<div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of MedPath platform</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (<motion.div key={card.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="h-full">
            <Card className="border-0 shadow-md bg-card h-full">
              <CardContent className="pt-6 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{card.label}</p>
                    <p className="text-3xl font-bold text-card-foreground mt-1">{stats[card.key]}</p>
                  </div>
                  <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <card.icon className="w-6 h-6 text-white"/>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Activity className="w-5 h-5 text-violet-500"/>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (<p className="text-muted-foreground text-center py-8">No recent activity</p>) : (<div className="space-y-4">
                {recentActivity.map((log) => (<div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted hover:bg-accent transition-colors">
                    <Badge className={`${actionTypeColors[log.action_type] || "bg-muted text-muted-foreground"} border-0`}>
                      {log.action_type.replace(/_/g, " ")}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {log.admin_name || "System"} -{" "}
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
