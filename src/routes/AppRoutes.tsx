// Mapa central de todas as URLs do app — bate com a seção 5 (Mapa de Paginas) do spec.
// Fica num arquivo só pra dar pra ver todas as rotas existentes numa olhada.
import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { MatriculaPage } from '../features/home/MatriculaPage'
import { LoginPage } from '../features/auth/LoginPage'
import { AtivarContaPage } from '../features/auth/AtivarContaPage'
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage'
import { AttendantDashboardPage } from '../features/attendant/AttendantDashboardPage'
import { AttendantCheckinPage } from '../features/attendant/AttendantCheckinPage'
import { AttendantPagamentoPage } from '../features/attendant/AttendantPagamentoPage'
import { AttendantPlanosPage } from '../features/attendant/AttendantPlanosPage'
import { ProfessionalDashboardPage } from '../features/professional/ProfessionalDashboardPage'
import { SubscriberDashboardPage } from '../features/subscriber/SubscriberDashboardPage'
import { SubscriberTreinoPage } from '../features/subscriber/SubscriberTreinoPage'
import { SubscriberFinanceiroPage } from '../features/subscriber/SubscriberFinanceiroPage'
import { SubscriberPlanoPage } from '../features/subscriber/SubscriberPlanoPage'
import { SubscriberObjetivosPage } from '../features/subscriber/SubscriberObjetivosPage'
import { SubscriberPersonalPage } from '../features/subscriber/SubscriberPersonalPage'
import { SubscriberPerfilPage } from '../features/subscriber/SubscriberPerfilPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/matricula" element={<MatriculaPage />} />
      {/* Pública de propósito: quem chega aqui ainda não tem senha (RF-ALU-01). */}
      <Route path="/ativar/:token" element={<AtivarContaPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente/checkin"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantCheckinPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente/planos"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantPlanosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente/pagamento/:alunoId"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantPagamentoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profissional"
        element={
          <ProtectedRoute allowedRole="professional">
            <ProfessionalDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno"
        element={
          <ProtectedRoute allowedRole="subscriber">
            <SubscriberDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/treino"
        element={
          <ProtectedRoute allowedRole="subscriber">
            <SubscriberTreinoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/financeiro"
        element={
          <ProtectedRoute allowedRole="subscriber">
            <SubscriberFinanceiroPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/plano"
        element={
          <ProtectedRoute allowedRole="subscriber">
            <SubscriberPlanoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/objetivos"
        element={
          <ProtectedRoute allowedRole="subscriber">
            <SubscriberObjetivosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/personal"
        element={
          <ProtectedRoute allowedRole="subscriber">
            <SubscriberPersonalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/perfil"
        element={
          <ProtectedRoute allowedRole="subscriber">
            <SubscriberPerfilPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
