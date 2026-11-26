
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
import { ProfessionalAlunosPage } from '../features/professional/ProfessionalAlunosPage'
import { ProfessionalAlunoPage } from '../features/professional/ProfessionalAlunoPage'
import { ProfessionalAvaliacoesPage } from '../features/professional/ProfessionalAvaliacoesPage'
import { ProfessionalAgendaPage } from '../features/professional/ProfessionalAgendaPage'

import { SubscriberDashboardPage } from '../features/subscriber/SubscriberDashboardPage'
import { SubscriberTreinoPage } from '../features/subscriber/SubscriberTreinoPage'

import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      {/* Autenticação e matrícula */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/matricula" element={<MatriculaPage />} />

      {/* Administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Atendente */}
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

      {/* Profissional */}
      <Route
        path="/profissional"
        element={
          <ProtectedRoute allowedRole="professional">
            <ProfessionalDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profissional/alunos"
        element={
          <ProtectedRoute allowedRole="professional">
            <ProfessionalAlunosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profissional/alunos/:alunoId"
        element={
          <ProtectedRoute allowedRole="professional">
            <ProfessionalAlunoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profissional/avaliacoes"
        element={
          <ProtectedRoute allowedRole="professional">
            <ProfessionalAvaliacoesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profissional/agenda"
        element={
          <ProtectedRoute allowedRole="professional">
            <ProfessionalAgendaPage />
          </ProtectedRoute>
        }
      />

      {/* Aluno */}
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

      {/* Página inicial e rota padrão */}
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
