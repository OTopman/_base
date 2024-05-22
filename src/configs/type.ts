export type LogLevel =
  | 'silent'
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly'
  
export type Environment = 'development' | 'production' | 'staging'

export type OTPType =
  | 'email'
  | 'phone'
  | 'password'

export type PaymentMethod =
  | 'card'
  | 'bank'
  | 'bank transfer'
  | 'ussd';



export type TransactionStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'cancelled'
