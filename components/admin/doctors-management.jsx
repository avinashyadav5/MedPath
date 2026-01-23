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
import { Stethoscope, Search, CheckCircle, Ban, ChevronLeft, ChevronRight, MapPin, Building } from "lucide-react";
import { verifyDoctor, toggleDoctorBlock } from "@/app/actions/admin-actions";
import { format } from "date-fns";
export function DoctorsManagement({ doctors, total, page, totalPages }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const updateFilters = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        }
        else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`/admin/doctors?${params.toString()}`);
    };
    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters("search", search);
    };
    const handleVerify = async (userId) => {
        startTransition(async () => {
            await verifyDoctor(userId);
        });
    };
    const handleToggleBlock = async (userId) => {
        startTransition(async () => {
            await toggleDoctorBlock(userId);
        });
    };
    const goToPage = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/admin/doctors?${params.toString()}`);
    };
    return (<div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Doctor Management</h1>
            <p className="text-muted-foreground mt-1">{total} registered doctors</p>
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
                  <Input placeholder="Search by name or specialty..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10"/>
                </div>
                <Button type="submit">Search</Button>
              </form>
              <Select defaultValue={searchParams.get("verified") || "all"} onValueChange={(value) => updateFilters("verified", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Verification"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={searchParams.get("blocked") || "all"} onValueChange={(value) => updateFilters("blocked", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Block Status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Blocked</SelectItem>
                  <SelectItem value="false">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Doctors Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Stethoscope className="w-5 h-5 text-violet-500"/>
              Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (<TableRow key={doctor.id} className={doctor.is_blocked ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">Dr. {doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {doctor.specialty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3"/>
                          {doctor.city}
                        </div>
                        {doctor.hospital_name && (<div className="flex items-center gap-1 text-muted-foreground opacity-70">
                            <Building className="w-3 h-3"/>
                            {doctor.hospital_name}
                          </div>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={doctor.is_verified ? "default" : "secondary"} className={doctor.is_verified ? "bg-emerald-500" : "bg-amber-500/10 text-amber-500"}>
                          {doctor.is_verified ? "Verified" : "Pending"}
                        </Badge>
                        {doctor.is_blocked && <Badge variant="destructive">Blocked</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(doctor.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!doctor.is_verified && (<Button variant="ghost" size="sm" onClick={() => handleVerify(doctor.id)} disabled={isPending} className="text-emerald-600 hover:text-emerald-700">
                            <CheckCircle className="w-4 h-4 mr-1"/>
                            Verify
                          </Button>)}
                        <Button variant="ghost" size="sm" onClick={() => handleToggleBlock(doctor.id)} disabled={isPending} className={doctor.is_blocked
                ? "text-emerald-600 hover:text-emerald-700"
                : "text-red-600 hover:text-red-700"}>
                          {doctor.is_blocked ? (<>
                              <CheckCircle className="w-4 h-4 mr-1"/>
                              Unblock
                            </>) : (<>
                              <Ban className="w-4 h-4 mr-1"/>
                              Block
                            </>)}
                        </Button>
                      </div>
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
