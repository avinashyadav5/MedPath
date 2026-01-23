"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, MapPin, Stethoscope, Activity, AlertTriangle, CheckCircle, Clock, XCircle, } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, } from "recharts";
const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    completed: Activity,
    cancelled: XCircle,
};
const urgencyColors = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
};
export function AnalyticsDashboard({ data }) {
    const appointmentStatusData = data.appointmentStats.map((item) => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: Number(item.count),
    }));
    const urgencyData = data.urgencyDistribution.map((item) => ({
        name: item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1),
        value: Number(item.count),
        color: urgencyColors[item.urgency] || "#94a3b8",
    }));
    const riskTrendData = data.riskTrends.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        risk: Math.round(Number(item.avg_risk)),
        count: Number(item.count),
    }));
    return (<div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-1">Platform performance and health metrics</p>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Common Diseases */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-md bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingUp className="w-5 h-5 text-violet-500"/>
                Most Common Diagnoses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.commonDiseases.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis type="number" stroke="#94a3b8"/>
                    <YAxis dataKey="diagnosis" type="category" width={120} stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(value) => (value.length > 15 ? value.slice(0, 15) + "..." : value)}/>
                    <Tooltip contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }} itemStyle={{ color: "hsl(var(--card-foreground))" }}/>
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* City Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-0 shadow-md bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <MapPin className="w-5 h-5 text-emerald-500"/>
                Patient Distribution by City
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.cityDistribution.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="city" stroke="#94a3b8" tick={{ fontSize: 12 }}/>
                    <YAxis stroke="#94a3b8"/>
                    <Tooltip contentStyle={{
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}/>
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appointment Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="border-0 shadow-md bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="w-5 h-5 text-blue-500"/>
                Appointment Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={appointmentStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {appointmentStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[50%] space-y-3">
                  {appointmentStatusData.map((item, index) => {
            const Icon = statusIcons[item.name.toLowerCase()] || Activity;
            return (<div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
                          <Icon className="w-4 h-4 text-muted-foreground"/>
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-semibold text-card-foreground">{item.value}</span>
                      </div>);
        })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Urgency Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card className="border-0 shadow-md bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <AlertTriangle className="w-5 h-5 text-amber-500"/>
                Diagnosis Urgency Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={urgencyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {urgencyData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[50%] space-y-3">
                  {urgencyData.map((item) => (<div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}/>
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold text-card-foreground">{item.value}</span>
                    </div>))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="lg:col-span-2">
          <Card className="border-0 shadow-md bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Activity className="w-5 h-5 text-red-500"/>
                Risk Level Trends (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }}/>
                    <YAxis stroke="#94a3b8" domain={[0, 100]}/>
                    <Tooltip contentStyle={{
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}/>
                    <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} name="Avg Risk %"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Doctor Utilization */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Stethoscope className="w-5 h-5 text-cyan-500"/>
              Doctor Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.doctorUtilization.slice(0, 6).map((doctor, index) => (<div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-muted hover:bg-accent transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {doctor.doctor_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">Dr. {doctor.doctor_name}</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                      {doctor.specialty}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-card-foreground">{doctor.appointment_count}</p>
                    <p className="text-xs text-muted-foreground">appointments</p>
                  </div>
                </div>))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
