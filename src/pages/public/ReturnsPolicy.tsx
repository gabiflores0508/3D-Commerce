import { useSEO } from '@/utils/seo';

export default function ReturnsPolicy() {
  useSEO('Trocas e devoluções');
  return (
    <div className="container-x py-12">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-mute">Política</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Trocas e devoluções</h1>
        <p className="mt-3 text-ink-mute">
          Trabalhamos para garantir a melhor experiência. Confira como funcionam nossas regras de troca e devolução.
        </p>
      </header>

      <div className="prose prose-sm mt-10 max-w-3xl text-ink-soft">
        <h2 className="text-lg font-bold text-ink">Prazo de arrependimento (CDC)</h2>
        <p>Você tem até 7 dias corridos após o recebimento do produto para solicitar a devolução por arrependimento.</p>

        <h2 className="mt-6 text-lg font-bold text-ink">Produtos com defeito</h2>
        <p>Em caso de defeito de fabricação, abra um chamado em até 30 dias. Após análise técnica, faremos a troca ou reembolso integral.</p>

        <h2 className="mt-6 text-lg font-bold text-ink">Como solicitar</h2>
        <ol className="list-decimal pl-5">
          <li>Entre em contato pelo WhatsApp ou e-mail.</li>
          <li>Envie o número do pedido e fotos/vídeos do produto.</li>
          <li>Receba as instruções de envio reverso.</li>
        </ol>

        <h2 className="mt-6 text-lg font-bold text-ink">O que não cobrimos</h2>
        <p>Produtos personalizados sob encomenda, danos por mau uso ou desgaste natural.</p>
      </div>
    </div>
  );
}
