export type Cargo = 'admin' | 'supervisor' | 'tecnico'

export interface Utilizador {
  id: string
  user_id: string | null
  nome: string
  username: string | null
  email: string
  telefone: string | null
  cargo: Cargo
  ativo: boolean
  avatar_url: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Equipa {
  id: string
  nome: string
  descricao: string | null
  cor: string
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface Loja {
  id: string
  nome: string
  codigo: string | null
  morada: string | null
  cidade: string | null
  codigo_postal: string | null
  pais: string
  telefone: string | null
  email_contacto: string | null
  contacto_nome: string | null
  notas: string | null
  estado: 'ativa' | 'inativa' | 'suspensa'
  created_at: string
  updated_at: string
}

export type TipoAcao = 'viagem' | 'trabalho' | 'alimentacao' | 'despesa'

export interface Acao {
  id: string
  jornada_id: string
  tipo: TipoAcao
  descricao: string | null
  imagem_url: string | null
  inicio: string
  fim: string | null
  created_at: string
}

export interface Jornada {
  id: string
  funcionario_id: string
  dia: string
  fim: string | null
  created_at: string
  funcionario?: Pick<Utilizador, 'id' | 'nome'>
  acoes?: Acao[]
}

export interface Servico {
  id: string
  numero: string
  titulo: string
  descricao: string | null
  loja_id: string
  equipa_id: string | null
  tecnico_responsavel_id: string | null
  estado: 'pendente' | 'em_curso' | 'resolvido' | 'fechado' | 'faturado'
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente'
  tipo: 'preventiva' | 'corretiva' | 'emergencia' | 'inspecao' | null
  data_prevista: string | null
  data_inicio: string | null
  data_fim: string | null
  horas_trabalhadas: number
  custo_materiais: number
  custo_mao_obra: number
  custo_total: number
  observacoes: string | null
  criado_por: string | null
  created_at: string
  updated_at: string
}
