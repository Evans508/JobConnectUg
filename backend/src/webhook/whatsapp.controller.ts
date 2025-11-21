import { Controller, Get, Post, Body, Query, Res, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

// Mock Types for illustration
interface WebhookPayload {
  object: string;
  entry: any[];
}

@Controller('webhooks/whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name);
  private readonly verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  /**
   * Verification step required by Meta when configuring the webhook.
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('Webhook verified successfully');
      return res.status(HttpStatus.OK).send(challenge);
    }
    return res.status(HttpStatus.FORBIDDEN).send('Forbidden');
  }

  /**
   * Receives the actual messages.
   */
  @Post()
  async handleMessage(@Body() body: WebhookPayload, @Res() res: Response) {
    // 1. Acknowledge immediately to prevent retries (Meta requirement < 3s)
    res.status(HttpStatus.OK).send('EVENT_RECEIVED');

    // 2. Process asynchronously
    try {
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            const value = change.value;
            if (value.messages && value.messages.length > 0) {
              const message = value.messages[0];
              
              // Only process text messages from groups
              if (message.type === 'text') {
                 const rawText = message.text.body;
                 const groupId = message.from; // In groups, 'from' is usually the group ID
                 const messageId = message.id;
                 
                 this.logger.log(`Received message ${messageId} from ${groupId}`);
                 
                 // TODO: Call Service to save to JobIngestLog table
                 // await this.ingestionService.logIncomingMessage({ rawText, groupId, messageId });
                 
                 // TODO: Dispatch to BullMQ worker for Gemini processing
                 // await this.queue.add('parse-job', { messageId });
              }
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing webhook payload', error);
      // Do not return error to Meta, logs only
    }
  }
}
