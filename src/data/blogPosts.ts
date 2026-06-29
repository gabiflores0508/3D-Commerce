import type { BlogPost } from '@/types';

export const seedBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'guia-rapido-escolher-primeiro-filamento',
    title: 'Guia rápido para escolher seu primeiro filamento',
    excerpt:
      'PLA, PETG ou ABS? Entenda em 5 minutos qual filamento combina com o seu projeto.',
    cover: '',
    author: 'Equipe 3DCommerce',
    category: 'Iniciante',
    readTime: '5 min',
    createdAt: '2026-05-12',
    content: `
Escolher o filamento certo é o primeiro grande passo na impressão 3D. Cada material tem características próprias de adesão, resistência e acabamento.

## PLA — o queridinho dos iniciantes
Fácil de imprimir, baixa contração e excelente para protótipos rápidos e peças decorativas.

## PETG — equilíbrio entre força e estética
Mais resistente que o PLA, com boa flexibilidade e bom acabamento brilhante.

## ABS — para peças funcionais
Alta resistência térmica e mecânica, ideal para peças que vão sofrer atrito ou calor.

Dica final: se você está começando, comece com PLA. É barato, fácil e perdoa erros de configuração.
    `,
  },
  {
    id: 'post-2',
    slug: 'pla-petg-abs-diferencas',
    title: 'Diferença entre PLA, PETG e ABS na prática',
    excerpt:
      'Comparativo rápido de propriedades, dificuldade e melhores usos para cada material.',
    cover: '',
    author: 'Equipe 3DCommerce',
    category: 'Materiais',
    readTime: '6 min',
    createdAt: '2026-05-20',
    content: `
Vamos comparar PLA, PETG e ABS de forma direta:

- **PLA**: fácil, rígido, baixa resistência ao calor (~60°C).
- **PETG**: médio, resistente, boa resistência ao calor (~80°C).
- **ABS**: difícil (precisa de mesa quente alta), excelente resistência mecânica e térmica.

Se vai ao sol, esqueça PLA. Se a peça é funcional, prefira PETG ou ABS.
    `,
  },
  {
    id: 'post-3',
    slug: 'como-escolher-primeira-impressora-3d',
    title: 'Como escolher sua primeira impressora 3D',
    excerpt:
      'Critérios práticos para não errar na escolha do seu primeiro equipamento de impressão 3D.',
    cover: '',
    author: 'Equipe 3DCommerce',
    category: 'Equipamentos',
    readTime: '8 min',
    createdAt: '2026-06-02',
    content: `
Antes de comprar, responda 3 perguntas:

1. Qual o uso principal? Peças funcionais, miniaturas, presentes?
2. Qual seu orçamento total (impressora + filamento + acessórios)?
3. Você quer praticidade ou gosta de mexer e calibrar?

A Ender 3 V3 é o caminho mais barato. A Bambu Lab A1 é o caminho mais prático. A Elegoo Mars é o caminho para miniaturas com detalhe.
    `,
  },
  {
    id: 'post-4',
    slug: 'quando-usar-resina-impressao-3d',
    title: 'Quando usar resina na impressão 3D',
    excerpt:
      'Quando vale a pena migrar do FDM para a impressão de resina LCD/SLA.',
    cover: '',
    author: 'Equipe 3DCommerce',
    category: 'Materiais',
    readTime: '4 min',
    createdAt: '2026-06-15',
    content: `
Resina é ideal quando você precisa de:

- Detalhamento extremo (miniaturas, jóias, modelos dentais).
- Acabamento liso direto da impressora.
- Peças pequenas em alta resolução.

Pontos de atenção: o pós-processo exige lavagem e cura UV.
    `,
  },
];
