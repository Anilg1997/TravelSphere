import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { first } from 'rxjs';
import { AiService, AiChatResponse } from '../../../services/ai.service';
import { AuthService } from '../../../services/auth.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, NgFor, NgIf, DatePipe],
  template: `
    <div class="page-container" style="max-width:800px">
      <h1 class="section-title">AI Travel Assistant</h1>
      <p class="section-subtitle">Ask me anything about your travel plans</p>

      <mat-card class="chat-container">
        <div class="chat-messages" #chatBox>
          <div *ngFor="let msg of messages" class="message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
            <div class="message-content">
              <div class="message-role">{{ msg.role === 'user' ? 'You' : 'TravelSphere AI' }}</div>
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ msg.timestamp | date:'shortTime' }}</div>
            </div>
          </div>
          <div *ngIf="loading" class="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="chat-input">
          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Ask about destinations, itineraries, tips...</mat-label>
            <input matInput [formControl]="messageCtrl" (keyup.enter)="sendMessage()" placeholder="e.g., Plan a 3-day trip to Goa" />
          </mat-form-field>
          <button mat-raised-button color="primary" class="cta-button" (click)="sendMessage()" [disabled]="loading || !messageCtrl.value?.trim()">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </mat-card>

      <mat-card style="margin-top:16px;padding:16px">
        <h3 style="margin:0 0 12px">Try asking:</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <button mat-stroked-button (click)="quickPrompt('Plan a 5-day trip to Kerala with ₹50,000 budget')">🌴 Kerala Trip</button>
          <button mat-stroked-button (click)="quickPrompt('What are the best places to visit in Europe?')">🏰 Europe</button>
          <button mat-stroked-button (click)="quickPrompt('Suggest travel insurance for a trip to Switzerland')">🛡️ Insurance</button>
          <button mat-stroked-button (click)="quickPrompt('What documents do I need for international travel?')">📄 Documents</button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .chat-container { height: 500px; display: flex; flex-direction: column; overflow: hidden; border-radius: 24px !important; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 24px; }
    .message { display: flex; margin-bottom: 16px; }
    .message.user { justify-content: flex-end; }
    .message-content { max-width: 75%; padding: 12px 16px; border-radius: 16px; }
    .user .message-content { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
    .assistant .message-content { background: #f0f2f5; color: #1a1a2e; border-bottom-left-radius: 4px; }
    .message-role { font-size: 0.8rem; font-weight: 600; margin-bottom: 4px; opacity: 0.8; }
    .message-text { line-height: 1.5; white-space: pre-wrap; }
    .message-time { font-size: 0.7rem; margin-top: 4px; opacity: 0.6; text-align: right; }
    .chat-input { display: flex; gap: 8px; padding: 16px; border-top: 1px solid #eee; }
    .loading-dots { display: flex; gap: 4px; padding: 12px 16px; }
    .loading-dots span { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; animation: bounce 1.4s ease-in-out infinite; }
    .loading-dots span:nth-child(2) { animation-delay: 0.16s; }
    .loading-dots span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
  `]
})
export class AiChatComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private aiService = inject(AiService);
  private authService = inject(AuthService);

  messages: ChatMessage[] = [
    { role: 'assistant', content: '👋 Hello! I\'m your TravelSphere AI assistant. Ask me about destinations, itineraries, travel tips, or anything travel-related!', timestamp: new Date() },
  ];
  loading = false;
  sessionId: string | null = null;
  messageCtrl = this.fb.control('');

  ngOnInit() {
    // Support ?q=… from the landing-page hero card: prefill & auto-send
    this.route.queryParamMap.pipe(first()).subscribe((params) => {
      const q = (params.get('q') || '').trim();
      if (!q) return;
      this.messageCtrl.setValue(q);
      setTimeout(() => this.sendMessage(), 500);
    });
  }

  sendMessage() {
    const content = this.messageCtrl.value?.trim();
    if (!content || this.loading) return;

    this.messages.push({ role: 'user', content, timestamp: new Date() });
    this.messageCtrl.reset();
    this.loading = true;

    // Get user ID if available
    let userId: string | undefined;
    this.authService.user$.pipe(first()).subscribe(u => { userId = u?.id; });

    const request = {
      message: content,
      sessionId: this.sessionId || undefined,
      userId: userId,
    };

    this.aiService.chat(request).subscribe({
      next: (response) => {
        this.sessionId = response.sessionId;
        this.messages.push({
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(response.timestamp),
        });
        this.loading = false;
      },
      error: () => {
        // Fallback to local response if AI service is unavailable
        this.messages.push({
          role: 'assistant',
          content: this.getFallbackResponse(content),
          timestamp: new Date(),
        });
        this.loading = false;
      },
    });
  }

  quickPrompt(prompt: string) {
    this.messageCtrl.setValue(prompt);
    this.sendMessage();
  }

  private getFallbackResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('trip') || lower.includes('plan') || lower.includes('itinerary')) {
      return `Here's a suggested itinerary:\n\n**Day 1:** Arrive and check in. Explore local attractions.\n**Day 2:** Visit major landmarks and enjoy local cuisine.\n**Day 3:** Leisure activities and shopping.\n\nWould you like me to customize this further?`;
    }
    if (lower.includes('insurance')) {
      return `For travel insurance, I recommend:\n- **Basic Plan:** ₹500 for 7 days (covers medical emergencies)\n- **Standard Plan:** ₹1,200 for 7 days (covers medical + baggage + trip cancellation)\n- **Premium Plan:** ₹2,500 for 7 days (comprehensive coverage)\n\nWould you like to check rates for your specific trip?`;
    }
    if (lower.includes('document') || lower.includes('visa')) {
      return `For international travel, you typically need:\n1. ✅ Valid passport (6+ months validity)\n2. ✅ Visa (check requirements per country)\n3. ✅ Travel insurance\n4. ✅ Flight/hotel bookings\n5. ✅ Vaccination certificates (if required)\n\nCheck your destination's embassy website for specific requirements.`;
    }
    return `That's a great question! Based on your interests, I'd recommend exploring our travel packages, checking flight deals, or looking into travel insurance options. You can browse our search page for specific destinations or use the Trip Planner for a custom itinerary!`;
  }
}
