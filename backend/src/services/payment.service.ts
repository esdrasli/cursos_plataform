import axios from 'axios';
import Stripe from 'stripe';

export interface PaymentMetadata {
  courseId?: string;
  userId?: string;
  affiliateCode?: string;
  [key: string]: unknown;
}

export interface PaymentData {
  amount: number;
  description: string;
  paymentMethod: 'credit' | 'pix' | 'boleto';
  cardData?: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
    installments?: number;
  };
  customer: {
    name: string;
    email: string;
    document?: string;
  };
  metadata?: PaymentMetadata;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  paymentLink?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixCode?: string;
  boletoUrl?: string;
  message?: string;
  error?: string;
}

export class PaymentService {
  private gateway: string;
  private apiKey: string;
  private apiSecret?: string;
  private webhookUrl?: string;
  private stripe?: Stripe;

  constructor() {
    this.gateway = process.env.PAYMENT_GATEWAY || 'stripe';
    this.apiKey = process.env.PAYMENT_API_KEY || process.env.STRIPE_SECRET_KEY || '';
    this.apiSecret = process.env.PAYMENT_API_SECRET || process.env.STRIPE_SECRET_KEY || '';
    this.webhookUrl = process.env.PAYMENT_WEBHOOK_URL || '';
    
    // Inicializar Stripe se configurado
    const stripeKey = process.env.STRIPE_SECRET_KEY || this.apiSecret;
    if (this.gateway.toLowerCase() === 'stripe' && stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2025-10-29.clover',
      });
    }
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    switch (this.gateway.toLowerCase()) {
      case 'mercadopago':
        return this.processMercadoPago(data);
      case 'stripe':
        return this.processStripe(data);
      case 'pagseguro':
        return this.processPagSeguro(data);
      default:
        throw new Error(`Gateway de pagamento não suportado: ${this.gateway}`);
    }
  }

  private async processMercadoPago(data: PaymentData): Promise<PaymentResult> {
    try {
      if (!this.apiKey) {
        throw new Error('API Key do Mercado Pago não configurada');
      }

      if (data.paymentMethod === 'pix') {
        // Criar pagamento PIX
        const response = await axios.post(
          'https://api.mercadopago.com/v1/payments',
          {
            transaction_amount: data.amount,
            description: data.description,
            payment_method_id: 'pix',
            payer: {
              email: data.customer.email,
              first_name: data.customer.name.split(' ')[0],
              last_name: data.customer.name.split(' ').slice(1).join(' ') || '',
            },
            metadata: {
              course_id: data.metadata?.courseId,
              user_id: data.metadata?.userId,
              ...data.metadata,
            },
            notification_url: this.webhookUrl,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return {
          success: true,
          transactionId: response.data.id.toString(),
          status: response.data.status === 'approved' ? 'approved' : 'pending',
          qrCode: response.data.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: response.data.point_of_interaction?.transaction_data?.qr_code_base64,
          pixCode: response.data.point_of_interaction?.transaction_data?.qr_code,
        };
      } else if (data.paymentMethod === 'credit') {
        // Criar pagamento com cartão de crédito
        if (!data.cardData) {
          throw new Error('Dados do cartão são obrigatórios para pagamento com cartão');
        }

        // Processar token do cartão (em produção, use o SDK do Mercado Pago no frontend)
        // Por enquanto, vamos criar um pagamento direto
        const response = await axios.post(
          'https://api.mercadopago.com/v1/payments',
          {
            transaction_amount: data.amount,
            description: data.description,
            payment_method_id: 'visa', // Em produção, detectar automaticamente
            installments: data.cardData.installments || 1,
            payer: {
              email: data.customer.email,
              identification: data.customer.document ? {
                type: 'CPF',
                number: data.customer.document.replace(/\D/g, ''),
              } : undefined,
            },
            card: {
              // Em produção, use tokens seguros do Mercado Pago
              // Por enquanto, apenas estrutura básica
            },
            metadata: {
              course_id: data.metadata?.courseId,
              user_id: data.metadata?.userId,
              ...data.metadata,
            },
            notification_url: this.webhookUrl,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return {
          success: response.data.status === 'approved' || response.data.status === 'pending',
          transactionId: response.data.id.toString(),
          status: this.mapMercadoPagoStatus(response.data.status),
          message: response.data.status_detail,
        };
      } else if (data.paymentMethod === 'boleto') {
        // Criar boleto
        const response = await axios.post(
          'https://api.mercadopago.com/v1/payments',
          {
            transaction_amount: data.amount,
            description: data.description,
            payment_method_id: 'bolbradesco', // ou outro banco
            payer: {
              email: data.customer.email,
              first_name: data.customer.name.split(' ')[0],
              last_name: data.customer.name.split(' ').slice(1).join(' ') || '',
            },
            metadata: {
              course_id: data.metadata?.courseId,
              user_id: data.metadata?.userId,
              ...data.metadata,
            },
            notification_url: this.webhookUrl,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return {
          success: true,
          transactionId: response.data.id.toString(),
          status: 'pending',
          boletoUrl: response.data.transaction_details?.external_resource_url,
        };
      }

      throw new Error('Método de pagamento não suportado');
    } catch (error: unknown) {
      const isAxiosError = (err: unknown): err is { response?: { data?: { message?: string } }; message?: string } => {
        return typeof err === 'object' && err !== null;
      };
      const axiosError = isAxiosError(error) ? error : null;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const axiosMessage = axiosError?.response?.data?.message;
      console.error('Erro ao processar pagamento Mercado Pago:', axiosError?.response?.data || errorMessage);
      return {
        success: false,
        transactionId: '',
        status: 'rejected',
        error: axiosMessage || errorMessage || 'Erro ao processar pagamento',
      };
    }
  }

  private async processStripe(data: PaymentData): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe não configurado. Verifique STRIPE_SECRET_KEY no .env');
      }

      const amountInCents = Math.round(data.amount * 100);

      if (data.paymentMethod === 'credit') {
        // Pagamento com cartão de crédito usando Payment Intent
        if (!data.cardData) {
          throw new Error('Dados do cartão são obrigatórios para pagamento com cartão');
        }

        // Criar ou buscar customer
        let customer;
        try {
          const customers = await this.stripe.customers.list({
            email: data.customer.email,
            limit: 1,
          });
          customer = customers.data[0] || await this.stripe.customers.create({
            email: data.customer.email,
            name: data.customer.name,
            metadata: {
              userId: data.metadata?.userId || '',
            },
          });
        } catch {
          // Se falhar ao buscar customer, criar um novo
          customer = await this.stripe.customers.create({
            email: data.customer.email,
            name: data.customer.name,
            metadata: {
              userId: data.metadata?.userId || '',
            },
          });
        }

        // Criar Payment Intent
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'brl',
          customer: customer.id,
          description: data.description,
          metadata: {
            courseId: data.metadata?.courseId || '',
            userId: data.metadata?.userId || '',
            affiliateCode: data.metadata?.affiliateCode || '',
          },
          payment_method_types: ['card'],
        });

        // Confirmar pagamento com cartão
        // NOTA: Em produção, o frontend deve usar Stripe Elements para criar um Payment Method seguro
        // Por enquanto, vamos retornar o client_secret para o frontend processar
        return {
          success: true,
          transactionId: paymentIntent.id,
          status: paymentIntent.status === 'succeeded' ? 'approved' : 
                  paymentIntent.status === 'requires_payment_method' ? 'pending' : 'pending',
          paymentLink: paymentIntent.client_secret,
          message: paymentIntent.status,
        };
      } else if (data.paymentMethod === 'pix') {
        // Criar Payment Intent para PIX
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'brl',
          description: data.description,
          metadata: {
            courseId: data.metadata?.courseId || '',
            userId: data.metadata?.userId || '',
            affiliateCode: data.metadata?.affiliateCode || '',
          },
          payment_method_types: ['pix'],
        });

        // Obter QR Code do PIX
        const paymentMethod = await this.stripe.paymentMethods.create({
          type: 'pix',
        });

        const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: paymentMethod.id,
        });

        // Buscar dados do PIX
        const pixData = confirmedIntent.next_action?.pix_display_qr_code;

        // A estrutura do Stripe PixDisplayQrCode tem 'data' como propriedade que contém o código QR
        const isPixDisplayQrCode = (data: unknown): data is { data?: string } => {
          return typeof data === 'object' && data !== null;
        };
        
        const qrCodeData = isPixDisplayQrCode(pixData) ? pixData.data : undefined;

        return {
          success: true,
          transactionId: paymentIntent.id,
          status: 'pending',
          qrCode: qrCodeData || '',
          pixCode: qrCodeData || '',
          paymentLink: paymentIntent.client_secret,
        };
      } else if (data.paymentMethod === 'boleto') {
        // Stripe não suporta boleto diretamente no Brasil
        // Vamos usar Payment Link como alternativa
        const paymentLink = await this.stripe.paymentLinks.create({
          line_items: [
            {
              price_data: {
                currency: 'brl',
                product_data: {
                  name: data.description,
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          metadata: {
            courseId: data.metadata?.courseId || '',
            userId: data.metadata?.userId || '',
            affiliateCode: data.metadata?.affiliateCode || '',
          },
        });

        return {
          success: true,
          transactionId: paymentLink.id,
          status: 'pending',
          paymentLink: paymentLink.url,
          boletoUrl: paymentLink.url,
        };
      }

      throw new Error('Método de pagamento não suportado');
    } catch (error: unknown) {
      console.error('Erro ao processar pagamento Stripe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        transactionId: '',
        status: 'rejected',
        error: errorMessage || 'Erro ao processar pagamento',
      };
    }
  }

  private async processPagSeguro(_data: PaymentData): Promise<PaymentResult> {
    // Implementação para PagSeguro
    throw new Error('PagSeguro ainda não implementado');
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    switch (this.gateway.toLowerCase()) {
      case 'mercadopago':
        return this.verifyMercadoPago(transactionId);
      case 'stripe':
        return this.verifyStripe(transactionId);
      default:
        throw new Error(`Gateway de pagamento não suportado: ${this.gateway}`);
    }
  }

  private async verifyStripe(transactionId: string): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe não configurado');
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'approved' :
                paymentIntent.status === 'requires_payment_method' ? 'pending' :
                paymentIntent.status === 'canceled' ? 'rejected' : 'pending',
      };
    } catch (error: unknown) {
      console.error('Erro ao verificar pagamento Stripe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        transactionId,
        status: 'rejected',
        error: errorMessage,
      };
    }
  }

  private async verifyMercadoPago(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: response.data.status === 'approved',
        transactionId: response.data.id.toString(),
        status: this.mapMercadoPagoStatus(response.data.status),
      };
    } catch (error: unknown) {
      console.error('Erro ao verificar pagamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        transactionId,
        status: 'rejected',
        error: errorMessage,
      };
    }
  }

  private mapMercadoPagoStatus(status: string): 'pending' | 'approved' | 'rejected' | 'refunded' {
    const statusMap: Record<string, 'pending' | 'approved' | 'rejected' | 'refunded'> = {
      'pending': 'pending',
      'approved': 'approved',
      'rejected': 'rejected',
      'refunded': 'refunded',
      'partially_refunded': 'refunded',
      'cancelled': 'rejected',
    };

    return statusMap[status] || 'pending';
  }

  async handleWebhook(payload: unknown, signature?: string): Promise<{ transactionId: string; status: string } | null> {
    switch (this.gateway.toLowerCase()) {
      case 'mercadopago':
        return this.handleMercadoPagoWebhook(payload);
      case 'stripe':
        // Type guard para converter unknown para Buffer | string
        const stripePayload: Buffer | string = Buffer.isBuffer(payload) 
          ? payload 
          : typeof payload === 'string' 
            ? payload 
            : Buffer.from(JSON.stringify(payload));
        return this.handleStripeWebhook(stripePayload, signature);
      default:
        return null;
    }
  }

  private async handleStripeWebhook(payload: Buffer | string, signature?: string): Promise<{ transactionId: string; status: string } | null> {
    try {
      if (!this.stripe) {
        console.error('Stripe não configurado');
        return null;
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      
      // Converter payload para Buffer se necessário
      const payloadBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
      
      let event: Stripe.Event;
      
      if (signature && webhookSecret) {
        try {
          event = this.stripe.webhooks.constructEvent(payloadBuffer, signature, webhookSecret);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
          console.error('Erro ao verificar webhook do Stripe:', errorMessage);
          return null;
        }
      } else {
        // Em desenvolvimento sem webhook secret, processar diretamente
        if (process.env.NODE_ENV === 'production') {
          console.error('STRIPE_WEBHOOK_SECRET é obrigatório em produção');
          return null;
        }
        try {
          event = JSON.parse(payloadBuffer.toString()) as Stripe.Event;
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
          console.error('Erro ao parsear webhook do Stripe:', errorMessage);
          return null;
        }
      }

      // Processar eventos relevantes
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          transactionId: paymentIntent.id,
          status: 'approved',
        };
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          transactionId: paymentIntent.id,
          status: 'rejected',
        };
      } else if (event.type === 'payment_intent.canceled') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          transactionId: paymentIntent.id,
          status: 'rejected',
        };
      }

      return null;
    } catch (error: unknown) {
      console.error('Erro ao processar webhook do Stripe:', error);
      return null;
    }
  }

  private async handleMercadoPagoWebhook(payload: unknown): Promise<{ transactionId: string; status: string } | null> {
    try {
      // Type guard para verificar se payload tem estrutura esperada
      const isMercadoPagoPayload = (p: unknown): p is { data?: { id?: unknown }; id?: unknown } => {
        return typeof p === 'object' && p !== null;
      };
      if (!isMercadoPagoPayload(payload)) {
        return null;
      }
      // Mercado Pago envia o ID do pagamento no webhook
      const paymentId = payload.data?.id || payload.id;
      if (!paymentId) return null;

      const paymentInfo = await this.verifyMercadoPago(paymentId.toString());
      return {
        transactionId: paymentInfo.transactionId,
        status: paymentInfo.status,
      };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return null;
    }
  }
}

export const paymentService = new PaymentService();

