/**
 * Máscaras de formatação para campos brasileiros.
 * Cada função recebe o texto digitado e devolve o valor formatado.
 * São tolerantes a colagem (limpam tudo que não for dígito antes de formatar).
 */

function onlyDigits(v: string): string {
  return v.replace(/\D/g, '');
}

/** Telefone/WhatsApp: (54) 99999-9999 ou (54) 9999-9999 */
export function maskPhone(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, '($1');
  if (d.length <= 6) return d.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

/** CPF: 000.000.000-00 */
export function maskCPF(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

/** CNPJ: 00.000.000/0000-00 */
export function maskCNPJ(v: string): string {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

/** CPF ou CNPJ — escolhe pela quantidade de dígitos */
export function maskCpfCnpj(v: string): string {
  const d = onlyDigits(v);
  return d.length > 11 ? maskCNPJ(v) : maskCPF(v);
}

/** CEP: 00000-000 */
export function maskCEP(v: string): string {
  const d = onlyDigits(v).slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, '$1-$2');
}

export type MaskFn = (v: string) => string;
