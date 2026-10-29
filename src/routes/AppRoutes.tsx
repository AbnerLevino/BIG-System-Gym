// Mapa central de todas as URLs do app — bate com a seção 5 (Mapa de Paginas) do spec.
// Fica num arquivo só pra dar pra ver todas as rotas existentes numa olhada.
import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { MatriculaPage } from '../features/home/MatriculaPage'
import { LoginPage } from '../features/auth/LoginPage'
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage'
import { AttendantDashboardPage } from '../features/attendant/AttendantDashboardPage'
import { AttendantCadastroPage } from '../features/attendant/AttendantCadastroPage'
import { AttendantCheckinPage } from '../features/attendant/AttendantCheckinPage'
import { AttendantPagamentoPage } from '../features/attendant/AttendantPagamentoPage'
import { ProfessionalDashboardPage } from '../features/professional/ProfessionalDashboardPage'
import { SubscriberDashboardPage } from '../features/subscriber/SubscriberDashboardPage'
import { SubscriberTreinoPage } from '../features/subscriber/SubscriberTreinoPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/matricula" element={<MatriculaPage />} />
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
        path="/atendente/cadastro"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantCadastroPage />
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
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
