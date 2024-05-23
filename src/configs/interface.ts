export declare interface EmailConfig {
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export declare interface MailSenderOptions {
  subject: string;
  message: string;
}

export declare interface IGoogleServiceAccount {
  client_email: string;
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}
