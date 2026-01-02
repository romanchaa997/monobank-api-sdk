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
        status: 500
      });

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
  });
});
