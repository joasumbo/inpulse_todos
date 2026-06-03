import type { Servico } from '@/types'

export interface ServicoUI extends Servico {
  loja:    { id: string; nome: string } | null
  equipa:  { id: string; nome: string; cor: string } | null
  tecnico: { id: string; nome: string } | null
  criador: { id: string; nome: string } | null
}
