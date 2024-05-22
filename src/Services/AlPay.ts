/* eslint-disable require-jsdoc */
import config from '@/configs/index'
import { handleApiError } from '@/Helpers/util'
import axios from 'axios'

axios.defaults.baseURL = config.alpay.baseUrl

// eslint-disable-next-line require-jsdoc
export class AlPay {
  private authHeader () {
    const publicKey =
      config.environment === 'production'
        ? config.alpay.livePublicKey
        : config.alpay.testPublicKey
    return {
      Authorization: `Bearer ${publicKey}`
    }
  }

  async createWallet (name: string, email?: string, bvn?: string) {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/wallets/create',
      data: { name, email, bvn },
      headers: this.authHeader()
    }).catch(handleApiError)

    return res!.data
  }

  async initializeBankTransfer (
    fullName: string,
    email: string,
    amount: number,
    bankName: 'OPAY' | 'PROVIDUS' = 'OPAY'
  ) {
    const res = await axios({
      method: 'POST',
      url: '/api/v2/payments/transfer',
      data: { fullName, email, amount, bankName },
      headers: this.authHeader()
    }).catch(handleApiError)

    return res!.data;
  }

  async initializeUssdPayment (email: string, amount: number, bankCode: string) {
    const res = await axios({
      method: 'POST',
      url: '/api/v2/payments/ussd',
      data: { email, amount, bankCode },
      headers: this.authHeader()
    }).catch(handleApiError)

    return res!.data;
  }

  /**
   * Fetches a list of banks available for use with the Alpay API.
   *
   * @returns An array of bank objects, each containing the bank's name, code, and logo URL.
   */
  async fetchBanks () {
    const res = await axios({
      method: 'GET',
      url: '/api/v2/misc/banks',
      headers: this.authHeader()
    }).catch(handleApiError)

    return res!.data
  }

  async initializeCardPayment (
    email: string,
    amount: number,
    method?: string,
    name: string = 'NasoBet',
    callbackUrl: string = config.alpay.callbackUrl
  ) {
    const res = await axios({
      method: 'POST',
      url: '/api/v2/payments/card',
      data: {
        email,
        amount,
        method,
        fullName: name,
        callbackUrl
      },
      headers: this.authHeader()
    }).catch(handleApiError)

    return res!.data
  }

  async transferFund (accountNumber: string, bankCode: string, amount: number) {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/transactions/transfer',
      data: { accountNumber, bankCode, amount },
      headers: this.authHeader()
    }).catch(handleApiError)

    return res!.data
  }

  async fetchTransaction (transactionReference: string) {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/transactions/${transactionReference}`,
      headers: this.authHeader()
    }).catch(handleApiError)
    return res!.data
  }

  async fetchTransactions () {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/transactions',
      headers: this.authHeader()
    }).catch(handleApiError)
    return res!.data
  }

  async verifyAccount (accountNumber: string, bankCode: string) {
    const res = await axios({
      method: 'POST',
      url: '/api/v2/misc/verify-account',
      headers: this.authHeader(),
      data: { accountNumber, bankCode }
    }).catch(handleApiError)
    return res!.data
  }
}

