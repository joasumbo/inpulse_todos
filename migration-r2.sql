-- ============================================================
-- Correções 2ª ronda — store-inpulse (Gestão de Manutenção)
-- Corre TUDO de uma vez:  Supabase → SQL Editor → cola → RUN
-- ============================================================

-- 1) INÍCIO/FIM DA JORNADA -----------------------------------
--    Necessário para o botão "Finalizar Jornada de Trabalho"
--    e para mostrar a hora de início e de fim (print1/4/5).
ALTER TABLE maint_jornadas
  ADD COLUMN IF NOT EXISTS fim TIMESTAMPTZ;

-- 2) BUCKETS DE STORAGE (imagens) ----------------------------
--    'jornada'      -> fotos das ações da jornada  (PÚBLICO, lido por URL público)
--    'maint-anexos' -> anexos dos serviços         (PRIVADO, lido por signed URL)
insert into storage.buckets (id, name, public)
values ('jornada', 'jornada', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('maint-anexos', 'maint-anexos', false)
on conflict (id) do nothing;

-- Recarregar o schema da API REST
NOTIFY pgrst, 'reload schema';
