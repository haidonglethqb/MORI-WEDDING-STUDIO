export interface VerificationMail {
  userId: string
  email: string
  token: string
}

export interface AccountMail {
  sendVerification(message: VerificationMail): Promise<void>
  sendPasswordReset(message: VerificationMail): Promise<void>
}

export const ACCOUNT_MAIL = Symbol('ACCOUNT_MAIL')

/** Dev mail sink. The token is handed to the transport and is not written to logs. */
export class LoggingAccountMail implements AccountMail {
  sendVerification(message: VerificationMail): Promise<void> {
    void message.token
    return Promise.resolve()
  }

  sendPasswordReset(message: VerificationMail): Promise<void> {
    void message.token
    return Promise.resolve()
  }
}
