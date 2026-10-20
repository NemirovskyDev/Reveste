export type ServiceErrorCode =
  | "invalid-input"
  | "email-in-use"
  | "invalid-credentials"
  | "not-found"
  | "cep-unavailable"
  | "unavailable";

/** Erro esperado de um serviço. A mensagem já é legível para a pessoa e pode ir direto para a tela. */
export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message: string) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
  }
}
