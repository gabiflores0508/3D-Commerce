import { useSEO } from '@/utils/seo';

export default function PrivacyPolicy() {
  useSEO('Política de Privacidade');
  return (
    <div className="container-x py-12">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-mute">Política</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Política de Privacidade</h1>
        <p className="mt-3 text-ink-mute">
          A 3DCommerce respeita a sua privacidade e segue as diretrizes da LGPD.
        </p>
      </header>

      <div className="prose prose-sm mt-10 max-w-3xl text-ink-soft">
        <h2 className="text-lg font-bold text-ink">Quais dados coletamos</h2>
        <p>Nome, e-mail, telefone, CPF e endereço, apenas para finalizar pedidos e prestar atendimento.</p>

        <h2 className="mt-6 text-lg font-bold text-ink">Como usamos</h2>
        <p>Processar pedidos, emitir nota fiscal, enviar produtos e comunicação relevante. Não vendemos seus dados a terceiros.</p>

        <h2 className="mt-6 text-lg font-bold text-ink">Cookies</h2>
        <p>Utilizamos cookies essenciais para o funcionamento do carrinho e da experiência de compra.</p>

        <h2 className="mt-6 text-lg font-bold text-ink">Seus direitos</h2>
        <p>Você pode solicitar a exclusão, correção ou exportação dos seus dados a qualquer momento via WhatsApp ou e-mail.</p>
      </div>
    </div>
  );
}
