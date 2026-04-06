import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PagamentoService } from '@/services/pagamentoService';
import { EntregaServiceApi } from '@/services/api/entregaServiceApi';
import {
  lerCheckoutPixPendente,
  limparCheckoutPixPendente,
  type CheckoutPixPendentePayload,
} from '@/utils/checkoutPixPendente';
import type { IResumoPagamentosVenda } from '@/interfaces/pagamento';
import { isPagamentoFalhou, vendaStatusNorm } from './pagamentoPixUtils';

const POLL_MS = 3000;

export type PagamentoPixPhase = 'loading' | 'invalid' | 'falha' | 'pagar';

export function usePagamentoPixModel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vendaQuery = searchParams.get('venda') ?? '';

  const [payload, setPayload] = useState<CheckoutPixPendentePayload | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [resumo, setResumo] = useState<IResumoPagamentosVenda | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const entregaApi = useMemo(() => new EntregaServiceApi(), []);
  const finalizacaoEmAndamento = useRef(false);

  useEffect(() => {
    const p = lerCheckoutPixPendente();
    if (!p || p.vendaUuid !== vendaQuery) {
      setErro('Sessão de pagamento PIX inválida ou expirada. Refaça o checkout.');
      return;
    }
    setPayload(p);
  }, [vendaQuery]);

  const finalizarAposPagamento = useCallback(async () => {
    if (!payload || finalizacaoEmAndamento.current) return;
    finalizacaoEmAndamento.current = true;
    try {
      await entregaApi.cadastrarEntrega({
        vendaUuid: payload.vendaUuid,
        tipoFrete: payload.entrega.tipoFrete,
        endereco: payload.entrega.endereco,
        custo: payload.entrega.custoFrete,
      });
      limparCheckoutPixPendente();
      navigate(`/pedido-confirmado?pedido=${encodeURIComponent(payload.vendaUuid)}`);
    } catch (e) {
      finalizacaoEmAndamento.current = false;
      setErro(e instanceof Error ? e.message : 'Erro ao registrar entrega.');
    }
  }, [payload, entregaApi, navigate]);

  const pagamentoFalhou = useMemo(() => isPagamentoFalhou(resumo), [resumo]);

  useEffect(() => {
    if (!payload || pagamentoFalhou) return;

    let cancelled = false;

    const tick = async () => {
      try {
        const r = await PagamentoService.obterResumoPagamentosVenda(payload.vendaUuid);
        if (cancelled) return;
        setResumo(r);
        setErro(null);
        if (isPagamentoFalhou(r)) return;
        if (vendaStatusNorm(r.vendaStatus) === 'APROVADA' && !r.aguardandoPix) {
          await finalizarAposPagamento();
        }
      } catch (e) {
        if (!cancelled) {
          setErro(e instanceof Error ? e.message : 'Erro ao consultar status do pagamento.');
        }
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [payload, finalizarAposPagamento, pagamentoFalhou]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const copiar = useCallback(async (texto: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoIdx(idx);
      window.setTimeout(() => setCopiadoIdx((cur) => (cur === idx ? null : cur)), 2000);
    } catch {
      setErro('Não foi possível copiar. Copie manualmente.');
    }
  }, []);

  const simularWebhook = useCallback(async () => {
    if (!payload) return;
    setSimulando(true);
    setErro(null);
    try {
      for (const p of payload.pixPendentes) {
        await PagamentoService.confirmarWebhookPixSimulado({
          pagamentoUuid: p.pagamentoUuid,
          segredoConfirmacao: p.segredoConfirmacao,
        });
      }
      const r = await PagamentoService.obterResumoPagamentosVenda(payload.vendaUuid);
      setResumo(r);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao simular confirmação.');
      try {
        const r = await PagamentoService.obterResumoPagamentosVenda(payload.vendaUuid);
        setResumo(r);
      } catch {
        // noop
      }
    } finally {
      setSimulando(false);
    }
  }, [payload]);

  const expiraMsPorLinha = useMemo(() => {
    if (!payload) return [];
    return payload.pixPendentes.map((pix) => {
      const fromResumo = resumo?.pagamentos.find((p) => p.id === pix.pagamentoUuid)?.pixExpiraEm;
      const iso = fromResumo ?? pix.expiraEm;
      return new Date(iso).getTime();
    });
  }, [payload, resumo]);

  const algumPrazoClienteExpirou = useMemo(() => {
    if (pagamentoFalhou || !payload) return false;
    return expiraMsPorLinha.some((t) => nowMs > t);
  }, [expiraMsPorLinha, nowMs, pagamentoFalhou, payload]);

  const aguardandoBackendAinda = Boolean(
    resumo && vendaStatusNorm(resumo.vendaStatus) === 'AGUARDANDO PAGAMENTO',
  );

  const phase: PagamentoPixPhase = useMemo(() => {
    if (erro && !payload) return 'invalid';
    if (!payload) return 'loading';
    if (pagamentoFalhou) return 'falha';
    return 'pagar';
  }, [erro, payload, pagamentoFalhou]);

  return {
    phase,
    payload,
    erro,
    copiadoIdx,
    simulando,
    nowMs,
    expiraMsPorLinha,
    algumPrazoClienteExpirou,
    aguardandoBackendAinda,
    copiar,
    simularWebhook,
    navigate,
  };
}
