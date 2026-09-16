import { useEffect } from "react"
import { Navigate, Route, Routes, useNavigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { NotFound } from "@/components/page-state"
import { AuthProvider } from "@/context/auth-context"
import { setNavigator } from "@/lib/navigation"
import AdminLayout from "@/layouts/AdminLayout"
import DoctorLayout from "@/layouts/DoctorLayout"
import PatientLayout from "@/layouts/PatientLayout"
import { RedirectIfAuthed, RequireRole } from "@/layouts/RequireRole"

import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import ChatPage from "@/pages/ChatPage"

import PatientAssessmentPage from "@/pages/PatientAssessmentPage"
import PatientTriagePage from "@/pages/PatientTriagePage"
import PatientResultPage from "@/pages/PatientResultPage"
import PatientHistoryPage from "@/pages/PatientHistoryPage"
import PatientAppointmentsPage from "@/pages/PatientAppointmentsPage"
import PatientNearbyDoctorsPage from "@/pages/PatientNearbyDoctorsPage"
import PatientBookingPage from "@/pages/PatientBookingPage"

import DoctorDashboardPage from "@/pages/DoctorDashboardPage"
import DoctorOnboardingPage from "@/pages/DoctorOnboardingPage"
import DoctorSettingsPage from "@/pages/DoctorSettingsPage"
import DoctorAppointmentsPage from "@/pages/DoctorAppointmentsPage"

import AdminDashboardPage from "@/pages/AdminDashboardPage"
import AdminUsersPage from "@/pages/AdminUsersPage"
import AdminDoctorsPage from "@/pages/AdminDoctorsPage"
import AdminDiagnosesPage from "@/pages/AdminDiagnosesPage"
import AdminAppointmentsPage from "@/pages/AdminAppointmentsPage"
import AdminAuditLogsPage from "@/pages/AdminAuditLogsPage"
import AdminAnalyticsPage from "@/pages/AdminAnalyticsPage"

/** Hands react-router's navigate() to the API layer so it can stand in for redirect(). */
function NavigatorBridge() {
    const navigate = useNavigate()
    useEffect(() => setNavigator(navigate), [navigate])
    return null
}

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
                <NavigatorBridge />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/login"
                        element={
                            <RedirectIfAuthed>
                                <LoginPage />
                            </RedirectIfAuthed>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <RedirectIfAuthed>
                                <RegisterPage />
                            </RedirectIfAuthed>
                        }
                    />

                    {/* patient */}
                    <Route
                        path="/patient"
                        element={
                            <RequireRole role="patient">
                                <PatientLayout />
                            </RequireRole>
                        }
                    >
                        <Route index element={<Navigate to="/patient/appointments" replace />} />
                        <Route path="assessment" element={<PatientAssessmentPage />} />
                        <Route path="assessment/triage" element={<PatientTriagePage />} />
                        <Route path="result/:id" element={<PatientResultPage />} />
                        <Route path="history" element={<PatientHistoryPage />} />
                        <Route path="appointments" element={<PatientAppointmentsPage />} />
                        <Route path="nearby-doctors/:id" element={<PatientNearbyDoctorsPage />} />
                        <Route path="book/:doctorId" element={<PatientBookingPage />} />
                        <Route path="chat/:id" element={<ChatPage role="patient" />} />
                    </Route>

                    {/* doctor */}
                    <Route
                        path="/doctor"
                        element={
                            <RequireRole role="doctor">
                                <DoctorLayout />
                            </RequireRole>
                        }
                    >
                        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                        <Route path="dashboard" element={<DoctorDashboardPage />} />
                        <Route path="onboarding" element={<DoctorOnboardingPage />} />
                        <Route path="settings" element={<DoctorSettingsPage />} />
                        <Route path="appointments" element={<DoctorAppointmentsPage />} />
                        <Route path="chat/:appointmentId" element={<ChatPage role="doctor" />} />
                    </Route>

                    {/* admin */}
                    <Route
                        path="/admin"
                        element={
                            <RequireRole role="admin">
                                <AdminLayout />
                            </RequireRole>
                        }
                    >
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="doctors" element={<AdminDoctorsPage />} />
                        <Route path="diagnoses" element={<AdminDiagnosesPage />} />
                        <Route path="appointments" element={<AdminAppointmentsPage />} />
                        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                        <Route path="analytics" element={<AdminAnalyticsPage />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
            </AuthProvider>
        </ThemeProvider>
    )
}
