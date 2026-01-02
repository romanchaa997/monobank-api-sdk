/**
 * Monobank Open API SDK
 * TypeScript/JavaScript SDK for interacting with Monobank public and personal API
 */

export interface Currency {
  currencyCodeA: number;
  currencyCodeB: number;
  date: number;
  rateSell?: number;
  rateBuy?: number;
  rateCross?: number;
}

export interface ClientInfo {
  clientId: string;
  name: string;
  webHookUrl: string;
  permissions: string;
  accounts: Account[];
  jars: Jar[];
}

export interface Account {
  id: string;
  sendId: string;
  balance: number;
  creditLimit: number;
  type: string;
  currencyCode: number;
  cashbackType?: string;
  maskedPan: string[];
  iban: string;
}

export interface Jar {
  id: string;
  sendId: string;
  title: string;
  description: string;
  currencyCode: number;
  balance: number;
  goal: number;
}

export interface Statement {
  id: string;
  time: number;
  description: string;
  mcc: number;
  originalMcc: number;
  hold: boolean;
  amount: number;
  operationAmount: number;
  currencyCode: number;
  commissionRate: number;
  cashbackAmount: number;
  balance: number;
  comment?: string;
  receiptId?: string;
  invoiceId?: string;
  counterEdrpou?: string;
  counterIban?: string;
  counterName?: string;
}

export class MonobankAPI {
  private baseURL = 'https://api.monobank.ua';
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  /**
   * Get currency exchange rates
   */
  async getCurrencyRates(): Promise<Currency[]> {
    const response = await fetch(`${this.baseURL}/bank/currency`);
    if (!response.ok) {
      throw new Error(`Failed to fetch currency rates: ${response.statusText}`);
    }
    return response.json() as Currency[];
  }

  /**
   * Get client information (requires API token)
   */
  async getClientInfo(): Promise<ClientInfo> {
    if (!this.token) {
      throw new Error('API token is required for this operation');
    }
    const response = await fetch(`${this.baseURL}/personal/client-info`, {
      headers: {
        'X-Token': this.token,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch client info: ${response.statusText}`);
    }
    return response.json( as ClientInfo[;
  }

  /**
   * Get account statement
   * @param accountId Account identifier (0 for default account)
   * @param from Start timestamp in seconds
   * @param to End timestamp in seconds (optional)
   */
  async getStatement(
    accountId: string,
    from: number,
    to?: number
  ): Promise<Statement[]> {
    if (!this.token) {
      throw new Error('API token is required for this operation');
    }
    const toParam = to || Math.floor(Date.now() / 1000);
    const response = await fetch(
      `${this.baseURL}/personal/statement/${accountId}/${from}/${toParam}`,
      {
        headers: {
          'X-Token': this.token,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch statement: ${response.statusText}`);
    }
    return response.json( as Statement[];
  }

  /**
   * Set webhook URL for receiving transaction notifications
   * @param webhookUrl URL to receive POST requests
   */
  async setWebhook(webhookUrl: string): Promise<void> {
    if (!this.token) {
      throw new Error('API token is required for this operation');
    }
    const response = await fetch(`${this.baseURL}/personal/webhook`, {
      method: 'POST',
      headers: {
        'X-Token': this.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webHookUrl: webhookUrl }),
    });
    if (!response.ok) {
      throw new Error(`Failed to set webhook: ${response.statusText}`);
    }
  }
}

export default MonobankAPI;
