import { MonobankAPI } from '../index';

// Mock fetch globally
global.fetch = jest.fn();

describe('MonobankAPI', () => {
  let api: MonobankAPI;
  
  beforeEach(() => {
    api = new MonobankAPI();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getCurrencyRates', () => {
    it('should fetch and return currency rates', async () => {
      const mockRates = [
        {
          currencyCodeA: 840,
          currencyCodeB: 980,
          date: 1704191400,
          rateSell: 36.5,
          rateBuy: 36.2
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockRates
      });

      const result = await api.getCurrencyRates();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.monobank.ua/bank/currency'
      );
      expect(result).toEqual(mockRates);
    });

    it('should throw error on failed fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      statusText: '500'      });

      await expect(api.getCurrencyRates()).rejects.toThrow(
        'Failed to fetch currency rates: 500'
      );
    });
  });

  describe('getClientInfo', () => {
    it('should fetch client info with token', async () => {
      const mockClientInfo = {
        clientId: 'test123',
        name: 'Test User',
        webHookUrl: 'https://example.com/webhook',
        permissions: 'p'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockClientInfo
      });

      const apiWithToken = new MonobankAPI('test-token');
      const result = await apiWithToken.getClientInfo();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.monobank.ua/personal/client-info',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Token': 'test-token'
          })
        })
      );
      expect(result).toEqual(mockClientInfo);
    });

  it('should throw error on failed fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: '401'
    });

    const apiWithToken = new MonobankAPI('test-token');
    await expect(apiWithToken.getClientInfo()).rejects.toThrow(
      'Failed to fetch client info: 401'
    );
  });

  describe('getStatement', () => {
    it('should fetch account statement', async () => {
      const mockStatement = [
        {
          id: 'test-tx-1',
          time: 1234567890,
          description: 'Test transaction',
          amount: 10000,
          balance: 100000,
          currencyCode: 980
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatement
      });

      const apiWithToken = new MonobankAPI('test-token');
      const result = await apiWithToken.getStatement('0', 0, 1234567890);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/personal/statement/0/0/1234567890'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Token': 'test-token'
          })
        })
      );
      expect(result).toEqual(mockStatement);
    });

    it('should throw error on failed fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: '500'
      });

      const apiWithToken = new MonobankAPI('test-token');
      await expect(apiWithToken.getStatement('0', 0, 1234567890)).rejects.toThrow(
        'Failed to fetch statement: 500'
      );
    });

    it('should throw error when token is missing', async () => {
      const api = new MonobankAPI();
      await expect(api.getStatement('0', 0, 1234567890)).rejects.toThrow(
        'API token is required for this operation'
      );
    });

  describe('setWebhook', () => {
    it('should set webhook successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      const apiWithToken = new MonobankAPI('test-token');
      await apiWithToken.setWebhook('https://example.com/webhook');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/personal/webhook'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Token': 'test-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ webHookUrl: 'https://example.com/webhook' })
        })
      );
    });

    it('should throw error on failed webhook setup', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: '500'
      });

      const apiWithToken = new MonobankAPI('test-token');
      await expect(apiWithToken.setWebhook('https://example.com/webhook')).rejects.toThrow(
        'Failed to set webhook: 500'
      );
    });

    it('should throw error when token is missing', async () => {
      const api = new MonobankAPI();
      await expect(api.setWebhook('https://example.com/webhook')).rejects.toThrow(
        'API token is required for this operation'
      );
    });
  });
  });
  });
});
