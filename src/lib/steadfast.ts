import { supabase } from './supabase';
import { Order, SteadfastSettings, SteadfastOrderPayload, SteadfastConsignment } from '../types';

export const steadfastService = {
  /**
   * Fetch current Steadfast Courier configuration from Supabase
   */
  async getSettings(): Promise<SteadfastSettings> {
    try {
      const { data, error } = await supabase
        .from('steadfast_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.warn('getSteadfastSettings error:', err);
    }
    return {
      id: 'default',
      is_enabled: true,
      api_key: '',
      secret_key: '',
      base_url: 'https://portal.packzy.com/api/v1',
      default_delivery_type: 0,
      default_note: 'Please handle with care. Women Curator parcel.',
      auto_send_on_confirm: false
    };
  },

  /**
   * Save Steadfast API credentials & defaults
   */
  async saveSettings(settings: Partial<SteadfastSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('steadfast_settings')
        .upsert({
          ...settings,
          id: 'default',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Check Courier Account Balance & verify API credentials
   */
  async checkBalance(customApiKey?: string, customSecretKey?: string): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const settings = await this.getSettings();
      const apiKey = customApiKey || settings.api_key;
      const secretKey = customSecretKey || settings.secret_key;
      const baseUrl = settings.base_url || 'https://portal.packzy.com/api/v1';

      if (!apiKey || !secretKey) {
        return { success: false, error: 'Steadfast API Key and Secret Key are required.' };
      }

      const res = await fetch(`${baseUrl}/get_balance`, {
        method: 'GET',
        headers: {
          'Api-Key': apiKey.trim(),
          'Secret-Key': secretKey.trim(),
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.status === 200) {
        return { success: true, balance: Number(data.current_balance) || 0 };
      } else {
        return { success: false, error: data.message || 'Failed to fetch balance from Steadfast.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to Steadfast Courier.' };
    }
  },

  /**
   * Normalizes an 11-digit Bangladeshi mobile number
   */
  normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('880')) {
      return digits.slice(2);
    }
    if (digits.startsWith('88')) {
      return digits.slice(2);
    }
    return digits;
  },

  /**
   * Sends a specific order to Steadfast Courier and stores tracking details in Supabase
   */
  async sendOrder(
    order: Order,
    options?: { note?: string; deliveryType?: number; customCod?: number }
  ): Promise<{ success: boolean; consignment?: SteadfastConsignment; trackingCode?: string; error?: string }> {
    try {
      const settings = await this.getSettings();

      if (!settings.api_key || !settings.secret_key) {
        return {
          success: false,
          error: 'Steadfast API credentials are not configured. Please add your API Key & Secret Key in Settings.'
        };
      }

      const invoice = order.order_number || order.id || `WC-${Date.now()}`;
      const recipientName = (order.customer_name || 'Customer').trim().slice(0, 100);
      const recipientPhone = this.normalizePhone(order.phone || '');

      if (recipientPhone.length !== 11) {
        return {
          success: false,
          error: `Invalid phone number (${order.phone}). Steadfast requires an 11-digit mobile number.`
        };
      }

      const recipientAddress = [
        order.address,
        order.area,
        order.city,
        order.postal_code ? `Postal: ${order.postal_code}` : ''
      ]
        .filter(Boolean)
        .join(', ')
        .slice(0, 250);

      if (!recipientAddress) {
        return { success: false, error: 'Recipient address is required for courier delivery.' };
      }

      // COD calculation: If cash on delivery, collect total; if prepaid, 0
      const isCod = order.payment_method?.toLowerCase().includes('cash') || !order.payment_method;
      const codAmount = options?.customCod !== undefined ? options.customCod : isCod ? Number(order.total) || 0 : 0;

      // Item description
      const itemDesc = (order.items || [])
        .map(i => `${i.product_name} (${i.color_name || 'Std'}, ${i.size || 'M'}) x${i.quantity}`)
        .join('; ')
        .slice(0, 250);

      const totalLot = (order.items || []).reduce((sum, it) => sum + it.quantity, 0) || 1;

      const payload: SteadfastOrderPayload = {
        invoice,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_address: recipientAddress,
        cod_amount: codAmount,
        note: (options?.note || order.notes || settings.default_note || 'Women Curator parcel. Handle with care.').slice(0, 250),
        item_description: itemDesc || 'Women Curator Luxury Garment',
        total_lot: totalLot,
        delivery_type: options?.deliveryType !== undefined ? options.deliveryType : settings.default_delivery_type || 0
      };

      const baseUrl = settings.base_url || 'https://portal.packzy.com/api/v1';

      const res = await fetch(`${baseUrl}/create_order`, {
        method: 'POST',
        headers: {
          'Api-Key': settings.api_key.trim(),
          'Secret-Key': settings.secret_key.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status === 200 && data.consignment) {
        const consignment: SteadfastConsignment = data.consignment;

        // Update database order record with tracking details
        const updatePayload = {
          courier_provider: 'steadfast',
          courier_consignment_id: consignment.consignment_id,
          courier_tracking_code: consignment.tracking_code,
          courier_status: consignment.status || 'in_review',
          courier_sent_at: new Date().toISOString(),
          courier_response: consignment,
          status: 'shipped',
          updated_at: new Date().toISOString()
        };

        if (order.id) {
          await supabase.from('orders').update(updatePayload).eq('id', order.id);
        } else if (order.order_number) {
          await supabase.from('orders').update(updatePayload).eq('order_number', order.order_number);
        }

        // Sync local storage backup
        try {
          const orders = JSON.parse(localStorage.getItem('women_curator_orders') || '[]');
          const updated = orders.map((o: any) =>
            o.order_number === order.order_number ? { ...o, ...updatePayload } : o
          );
          localStorage.setItem('women_curator_orders', JSON.stringify(updated));
        } catch {}

        return {
          success: true,
          consignment,
          trackingCode: consignment.tracking_code
        };
      } else {
        return {
          success: false,
          error: data.message || (data.errors ? JSON.stringify(data.errors) : 'Steadfast rejected the consignment.')
        };
      }
    } catch (err: any) {
      console.error('Steadfast sendOrder error:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch order to Steadfast Courier.'
      };
    }
  },

  /**
   * Checks real-time delivery status by tracking code or invoice
   */
  async checkDeliveryStatus(identifier: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const settings = await this.getSettings();
      if (!settings.api_key || !settings.secret_key) {
        return { success: false, error: 'Steadfast credentials missing.' };
      }

      const baseUrl = settings.base_url || 'https://portal.packzy.com/api/v1';
      // First try by tracking code
      let res = await fetch(`${baseUrl}/status_by_trackingcode/${encodeURIComponent(identifier)}`, {
        headers: {
          'Api-Key': settings.api_key.trim(),
          'Secret-Key': settings.secret_key.trim(),
          'Content-Type': 'application/json'
        }
      });

      let data = await res.json();
      if (data.status === 200 && data.delivery_status) {
        return { success: true, status: data.delivery_status };
      }

      // Fallback: try by invoice
      res = await fetch(`${baseUrl}/status_by_invoice/${encodeURIComponent(identifier)}`, {
        headers: {
          'Api-Key': settings.api_key.trim(),
          'Secret-Key': settings.secret_key.trim(),
          'Content-Type': 'application/json'
        }
      });
      data = await res.json();

      if (data.status === 200 && data.delivery_status) {
        return { success: true, status: data.delivery_status };
      }

      return { success: false, error: data.message || 'Could not fetch delivery status' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Helper to get Steadfast tracking web URL
   */
  getTrackingUrl(trackingCode: string): string {
    return `https://steadfast.com.bd/t/${encodeURIComponent(trackingCode)}`;
  }
};
