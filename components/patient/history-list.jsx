"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Calendar } from "lucide-react";
const urgencyColors = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
};
export function HistoryList({ history }) {
    if (history.length === 0) {
        return (<Card className="border-0 shadow-lg bg-card backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
          <h3 className="text-lg font-medium text-foreground mb-2">No assessments yet</h3>
          <p className="text-muted-foreground mb-4">Start your first health assessment to see your history here.</p>
          <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
            <Link href="/patient/assessment">Start Assessment</Link>
          </Button>
        </CardContent>
      </Card>);
    }
    return (<div className="space-y-4">
      {history.map((item, index) => (<motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="border-0 shadow-lg bg-card backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4"/>
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })}
                  </div>
                  <p className="text-card-foreground font-medium line-clamp-2">{item.diagnosis}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={urgencyColors[item.urgency]}>
                      {item.urgency.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                      {item.specialty}
                    </Badge>
                    <Badge variant="outline">Risk: {item.risk_percent}%</Badge>
                  </div>
                </div>
                <Button asChild variant="ghost" className="shrink-0">
                  <Link href={`/patient/result/${item.id}`}>
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4"/>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>))}
    </div>);
}
