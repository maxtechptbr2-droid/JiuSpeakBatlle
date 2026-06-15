import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import crypto from 'crypto';

// Get access token securely from environment variable
const getMPClient = () => {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    console.error("⚠️ MERCADOPAGO_ACCESS_TOKEN is missing under environment configuration.");
    return null;
  }
  return new MercadoPagoConfig({ accessToken: token });
};

// Checkout Pro - Create payment link / Preference
export async function createPreference(params: {
  itemId: string;
  title: string;
  amount: number;
  email: string;
  metadata: any;
}) {
  const client = getMPClient();
  if (!client) {
    throw new Error("Mercado Pago client is offline. Configuration needed.");
  }

  const preference = new Preference(client);
  const response = await preference.create({
    body: {
      items: [
        {
          id: params.itemId,
          title: params.title,
          quantity: 1,
          unit_price: Number(params.amount),
          currency_id: 'BRL',
        }
      ],
      payer: {
        email: params.email,
      },
      back_urls: {
        success: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/profile?success=true`,
        failure: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/profile?success=false`,
        pending: `${process.env.APP_URL || 'http://localhost:3550'}/dashboard/profile?success=pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/mercadopago/webhook`,
      metadata: params.metadata,
    }
  });

  return {
    id: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point
  };
}

// Checkout Transparente - Create Direct payment (PIX, Card, Boleto)
export async function createDirectPayment(params: {
  transactionAmount: number;
  token?: string; // for credit card
  description: string;
  installments?: number;
  paymentMethodId: 'pix' | 'bolbradesco' | string;
  payerEmail: string;
  payerFirstName?: string;
  payerLastName?: string;
  identificationType?: string;
  identificationNumber?: string;
  metadata: any;
}) {
  const client = getMPClient();
  if (!client) {
    throw new Error("Mercado Pago client is offline. Configuration needed.");
  }

  const payment = new Payment(client);
  
  const paymentBody: any = {
    transaction_amount: Number(params.transactionAmount),
    description: params.description,
    payment_method_id: params.paymentMethodId,
    payer: {
      email: params.payerEmail,
      first_name: params.payerFirstName || 'Atleta',
      last_name: params.payerLastName || 'JiuSpeak',
    },
    metadata: params.metadata,
  };

  // If Pix or Boleto, we might need identification
  if (params.identificationType && params.identificationNumber) {
    paymentBody.payer.identification = {
      type: params.identificationType,
      number: params.identificationNumber
    };
  }

  if (params.paymentMethodId === 'pix') {
    // Standard requirements for PIX
  } else if (params.token) {
    // Credit card requirements
    paymentBody.token = params.token;
    paymentBody.installments = Number(params.installments || 1);
  }

  let result: any;
  try {
    result = await payment.create({ body: paymentBody });
  } catch (error: any) {
    console.error("Mercado Pago API error details:", error);
    throw error;
  }

  // Parse dynamic PIX QR / Copia e Cola data securely
  let qrCode = '';
  let qrCodeCopyPaste = '';
  
  if (result.point_of_interaction?.transaction_data) {
    qrCode = result.point_of_interaction.transaction_data.qr_code_base64 || '';
    qrCodeCopyPaste = result.point_of_interaction.transaction_data.qr_code || '';
  }

  return {
    id: result.id,
    status: result.status,
    statusDetail: result.status_detail,
    qrCode,
    qrCodeCopyPaste,
    barcode: (result as any).barcode?.content || '',
    transactionAmount: (result as any).transaction_amount,
    paymentMethodId: (result as any).payment_method_id,
  };
}
