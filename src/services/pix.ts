/**
 * BR Code do Pix ("copia e cola"), no formato EMV MPM do Banco Central.
 * O CRC16 é o CCITT-FALSE (polinômio 0x1021, valor inicial 0xFFFF).
 */

export function crc16(text: string): string {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const tlv = (id: string, value: string): string => `${id}${String(value.length).padStart(2, "0")}${value}`;

/** O BR Code aceita só ASCII; tira acentos e limita o tamanho exigido por cada campo. */
function ascii(value: string, max: number): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]/g, "")
    .slice(0, max);
}

export type PixPayloadInput = {
  key: string;
  merchantName: string;
  city: string;
  amountCents: number;
  /** Identificador da cobrança: letras e números, até 25 caracteres. */
  txid: string;
};

export function buildPixPayload({ key, merchantName, city, amountCents, txid }: PixPayloadInput): string {
  const amount = (amountCents / 100).toFixed(2);
  const account = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", key);
  const body =
    tlv("00", "01") +
    tlv("26", account) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", amount) +
    tlv("58", "BR") +
    tlv("59", ascii(merchantName, 25)) +
    tlv("60", ascii(city, 15)) +
    tlv("62", tlv("05", txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***")) +
    "6304";
  return body + crc16(body);
}
