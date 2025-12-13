import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Order, ProductType, Product, PRODUCT_CATALOG, ACCESSORY_THRESHOLD } from '@/types';

const COMMISSION_RATE = 0.15;

// Product catalog item from client (may have different structure)
interface ClientProduct {
  type: ProductType;
  name: string;
  pricePoint: number;
  priceTolerance: number;
}

// Identify product by matching price to known price points
function identifyProduct(
  price: number,
  customCatalog?: ClientProduct[],
  accessoryThreshold: number = ACCESSORY_THRESHOLD
): { type: ProductType; name: string; needsReview: boolean } {
  // Use custom catalog if provided, otherwise fall back to default
  const catalog = customCatalog && customCatalog.length > 0 ? customCatalog : PRODUCT_CATALOG;

  // Check against known products with tolerance
  for (const product of catalog) {
    const minPrice = product.pricePoint - product.priceTolerance;
    const maxPrice = product.pricePoint + product.priceTolerance;
    if (price >= minPrice && price <= maxPrice) {
      return { type: product.type, name: product.name, needsReview: false };
    }
  }

  // Check if it's likely an accessory (low price)
  if (price > 0 && price < accessoryThreshold) {
    return { type: 'accessory', name: 'Accessories/Lids', needsReview: false };
  }

  // Unknown product - flag for review
  // Could be a bundle, sale price, or new product
  return { type: 'unknown', name: 'Unknown Product', needsReview: true };
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, productCatalog, accessoryThreshold } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token provided' }, { status: 401 });
    }

    // Extract custom catalog from client's productCatalog if provided
    const customCatalog: ClientProduct[] | undefined = productCatalog?.products?.map((p: ClientProduct) => ({
      type: p.type,
      name: p.name,
      pricePoint: p.pricePoint,
      priceTolerance: p.priceTolerance
    }));
    const threshold = accessoryThreshold || ACCESSORY_THRESHOLD;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Search for Sourhouse affiliate emails from Affiliatly
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:affiliatly.com subject:"Sourhouse: New referred order"',
      maxResults: 500
    });

    const messages = response.data.messages || [];
    const orders: Order[] = [];
    const seenOrderIds = new Set<string>();

    for (const message of messages) {
      try {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        });

        // Get the email body
        let body = '';
        const payload = fullMessage.data.payload;
        
        if (payload?.body?.data) {
          body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        } else if (payload?.parts) {
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body = Buffer.from(part.body.data, 'base64').toString('utf-8');
              break;
            }
          }
        }

        // Parse order ID and price from email body
        // Format: "There is a new referred order with ID: SH43589 and price $329.99"
        const orderIdMatch = body.match(/order with ID:\s*([A-Z0-9]+)/i);
        const priceMatch = body.match(/price\s*\$?([\d,]+\.?\d*)/i);

        if (orderIdMatch && priceMatch) {
          const orderId = orderIdMatch[1];
          
          // Skip duplicates
          if (seenOrderIds.has(orderId)) {
            continue;
          }
          seenOrderIds.add(orderId);
          
          const price = parseFloat(priceMatch[1].replace(',', ''));
          
          // Get email date
          const headers = fullMessage.data.payload?.headers || [];
          const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date');
          const emailDate = dateHeader?.value ? new Date(dateHeader.value).toISOString() : new Date().toISOString();

          // Identify product by price point (use custom catalog if provided)
          const productInfo = identifyProduct(price, customCatalog, threshold);

          orders.push({
            id: message.id!,
            orderId,
            price,
            commission: price * COMMISSION_RATE,
            date: emailDate,
            emailId: message.id!,
            product: productInfo.type,
            productName: productInfo.name,
            needsReview: productInfo.needsReview
          });
        }
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
      }
    }

    // Sort by date descending
    orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ 
      orders,
      count: orders.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
