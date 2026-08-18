import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf, NgClass, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { AiService } from '../../../services/ai.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  cards?: TripCard[];
  itinerary?: ItineraryDay[];
  planSummary?: TripPlanSummary;
  actions?: ChatAction[];
}

interface TripCard {
  title: string;
  subtitle: string;
  icon: string;
  selected?: boolean;
  tag?: string;
  onSelect?: () => void;
}

interface ChatAction {
  label: string;
  icon: string;
  action: string;
  primary?: boolean;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  hotel?: string;
  hotelCost?: number;
  meals?: string;
  mealCost?: number;
  transport?: string;
  transportCost?: number;
  icon: string;
}

interface TripPlanSummary {
  destination: string;
  duration: number;
  members: number;
  budget: number;
  totalCost: number;
  hotelTotal: number;
  transportTotal: number;
  foodTotal: number;
  activitiesTotal: number;
  travelMode: string;
  startDate?: string;
}

interface PlanningState {
  step: 'idle' | 'destination' | 'duration' | 'budget' | 'members' | 'travel_mode' | 'preferences' | 'generating' | 'plan_ready' | 'booking' | 'payment';
  destination?: string;
  duration?: number;
  budget?: number;
  members?: number;
  travelMode?: string;
  preferences?: string[];
  plan?: TripPlanSummary;
}

@Component({
  selector: 'app-ai-agent',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule, MatCardModule, MatChipsModule, MatProgressSpinnerModule, NgFor, NgIf, NgClass, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <div class="agent-container">
      <!-- Header -->
      <div class="agent-header">
        <div class="agent-header-inner">
          <div class="agent-brand">
            <span class="agent-avatar">🤖</span>
            <div>
              <h1>TravelSphere AI Agent</h1>
              <span class="agent-status"><span class="status-dot"></span> Online — ready to plan your trip</span>
            </div>
          </div>
          <button mat-icon-button class="agent-clear-btn" (click)="clearChat()" title="Start new conversation">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="agent-chat" #chatBox>
        <div *ngFor="let msg of messages; let i = index" class="msg-row"
             [class.msg-user]="msg.role === 'user'"
             [class.msg-ai]="msg.role === 'assistant'"
             [class.msg-system]="msg.role === 'system'">

          <!-- AI Avatar -->
          <div *ngIf="msg.role === 'assistant'" class="msg-avatar">🤖</div>

          <div class="msg-body">
            <!-- Message Bubble -->
            <div class="msg-bubble" *ngIf="msg.content">
              <div class="msg-text" [innerHTML]="formatMessage(msg.content)"></div>
              <div class="msg-time">{{ msg.timestamp | date:'shortTime' }}</div>
            </div>

            <!-- Interactive Cards -->
            <div *ngIf="msg.cards && msg.cards.length > 0" class="msg-cards">
              <button *ngFor="let card of msg.cards" class="agent-card"
                      [class.selected]="card.selected"
                      (click)="selectCard(msg, card)">
                <mat-icon class="agent-card-icon">{{ card.icon }}</mat-icon>
                <div class="agent-card-text">
                  <strong>{{ card.title }}</strong>
                  <span>{{ card.subtitle }}</span>
                </div>
                <span *ngIf="card.tag" class="agent-card-tag">{{ card.tag }}</span>
                <mat-icon *ngIf="card.selected" class="agent-card-check">check_circle</mat-icon>
              </button>
            </div>

            <!-- Action Buttons -->
            <div *ngIf="msg.actions && msg.actions.length > 0" class="msg-actions">
              <button *ngFor="let act of msg.actions" mat-raised-button
                      [color]="act.primary ? 'primary' : ''"
                      class="agent-action-btn"
                      [class.action-primary]="act.primary"
                      (click)="handleAction(act)">
                <mat-icon>{{ act.icon }}</mat-icon> {{ act.label }}
              </button>
            </div>

            <!-- Itinerary Display -->
            <div *ngIf="msg.itinerary && msg.itinerary.length > 0" class="itinerary-container">
              <div class="itinerary-header">
                <mat-icon>route</mat-icon>
                <span>Day-by-Day Itinerary</span>
              </div>
              <div *ngFor="let day of msg.itinerary" class="itinerary-day">
                <div class="itinerary-day-header">
                  <span class="day-badge">Day {{ day.day }}</span>
                  <span class="day-title">{{ day.title }}</span>
                  <span class="day-icon">{{ day.icon }}</span>
                </div>
                <div class="itinerary-day-body">
                  <div *ngFor="let act of day.activities" class="day-activity">
                    <mat-icon class="activity-dot">circle</mat-icon>
                    <span>{{ act }}</span>
                  </div>
                  <div class="day-details">
                    <span *ngIf="day.hotel" class="detail-chip">
                      <mat-icon>hotel</mat-icon> {{ day.hotel }}
                      <span *ngIf="day.hotelCost"> · ₹{{ day.hotelCost | number }}</span>
                    </span>
                    <span *ngIf="day.meals" class="detail-chip">
                      <mat-icon>restaurant</mat-icon> {{ day.meals }}
                      <span *ngIf="day.mealCost"> · ₹{{ day.mealCost | number }}</span>
                    </span>
                    <span *ngIf="day.transport" class="detail-chip">
                      <mat-icon>directions_bus</mat-icon> {{ day.transport }}
                      <span *ngIf="day.transportCost"> · ₹{{ day.transportCost | number }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Plan Summary -->
            <div *ngIf="msg.planSummary" class="plan-summary-card">
              <div class="plan-summary-header">
                <mat-icon>summarize</mat-icon>
                <span>Trip Summary</span>
              </div>
              <div class="plan-summary-grid">
                <div class="summary-item">
                  <mat-icon>place</mat-icon>
                  <div><strong>Destination</strong><span>{{ msg.planSummary.destination }}</span></div>
                </div>
                <div class="summary-item">
                  <mat-icon>calendar_today</mat-icon>
                  <div><strong>Duration</strong><span>{{ msg.planSummary.duration }} days</span></div>
                </div>
                <div class="summary-item">
                  <mat-icon>group</mat-icon>
                  <div><strong>Travelers</strong><span>{{ msg.planSummary.members }} members</span></div>
                </div>
                <div class="summary-item">
                  <mat-icon>payments</mat-icon>
                  <div><strong>Your Budget</strong><span>₹{{ msg.planSummary.budget | number }}</span></div>
                </div>
              </div>
              <div class="plan-cost-breakdown">
                <div class="cost-row"><span>🏨 Hotels</span><span>₹{{ msg.planSummary.hotelTotal | number }}</span></div>
                <div class="cost-row"><span>🚌 Transport ({{ msg.planSummary.travelMode }})</span><span>₹{{ msg.planSummary.transportTotal | number }}</span></div>
                <div class="cost-row"><span>🍽️ Food & Dining</span><span>₹{{ msg.planSummary.foodTotal | number }}</span></div>
                <div class="cost-row"><span>🎯 Activities & Sightseeing</span><span>₹{{ msg.planSummary.activitiesTotal | number }}</span></div>
                <div class="cost-row cost-total"><span>Total Estimated Cost</span><span>₹{{ msg.planSummary.totalCost | number }}</span></div>
                <div class="cost-row cost-savings" *ngIf="msg.planSummary.budget > msg.planSummary.totalCost">
                  <span>💰 You save</span><span>₹{{ msg.planSummary.budget - msg.planSummary.totalCost | number }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- User Avatar -->
          <div *ngIf="msg.role === 'user'" class="msg-avatar msg-avatar-user">👤</div>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="loading" class="msg-row msg-ai">
          <div class="msg-avatar">🤖</div>
          <div class="msg-body">
            <div class="msg-bubble typing-bubble">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="agent-input-area">
        <div class="agent-input-row">
          <input #userInput class="agent-input" [placeholder]="getInputPlaceholder()"
                 (keyup.enter)="sendMessage(userInput.value)"
                 [disabled]="loading" />
          <button class="agent-send-btn" (click)="sendMessage(userInput.value)"
                  [disabled]="loading || !userInput.value.trim()">
            <mat-icon>send</mat-icon>
          </button>
        </div>
        <div class="agent-quick-chips" *ngIf="state.step === 'idle'">
          <button *ngFor="let q of quickStarts" class="quick-chip" (click)="sendMessage(q)">{{ q }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }

    .agent-container {
      display: flex; flex-direction: column;
      height: 100%; max-width: 900px; margin: 0 auto;
      background: #faf8f5;
    }

    /* ── Header ── */
    .agent-header {
      background: linear-gradient(135deg, #1e4b47, #2f6a63);
      padding: 16px 24px; flex-shrink: 0;
    }
    .agent-header-inner {
      display: flex; align-items: center; justify-content: space-between;
    }
    .agent-brand { display: flex; align-items: center; gap: 14px; }
    .agent-avatar {
      width: 48px; height: 48px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      background: rgba(255,255,255,0.15);
    }
    .agent-brand h1 { font-family: var(--serif); font-size: 1.15rem; color: #fff; margin: 0; }
    .agent-status { font-size: 0.78rem; color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; }
    .agent-clear-btn { color: rgba(255,255,255,0.8); }

    /* ── Chat Area ── */
    .agent-chat {
      flex: 1; overflow-y: auto; padding: 24px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .msg-row { display: flex; gap: 12px; max-width: 100%; }
    .msg-user { justify-content: flex-end; }
    .msg-ai { justify-content: flex-start; }
    .msg-avatar {
      width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; background: #e8e4de;
    }
    .msg-avatar-user { background: linear-gradient(135deg, #1e4b47, #2f6a63); }

    .msg-body { max-width: 75%; min-width: 0; }
    .msg-bubble {
      padding: 14px 18px; border-radius: 18px;
      font-size: 0.92rem; line-height: 1.6;
    }
    .msg-ai .msg-bubble { background: #fff; border: 1px solid #e8e4de; border-bottom-left-radius: 4px; }
    .msg-user .msg-bubble { background: #1e4b47; color: #fff; border-bottom-right-radius: 4px; }
    .msg-text { white-space: pre-wrap; }
    .msg-text strong { color: var(--teal, #1e4b47); }
    .msg-time { font-size: 0.7rem; margin-top: 6px; opacity: 0.5; text-align: right; }

    /* ── Typing Indicator ── */
    .typing-bubble { padding: 16px 24px !important; }
    .typing-dots { display: flex; gap: 5px; }
    .typing-dots span {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--teal, #1e4b47);
      animation: dotBounce 1.4s ease-in-out infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.16s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes dotBounce { 0%,80%,100% { transform: scale(0.4); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

    /* ── Interactive Cards ── */
    .msg-cards { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
    .agent-card {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-radius: 14px;
      border: 1.5px solid #e0dbd4; background: #fff;
      cursor: pointer; transition: all 0.2s ease;
      text-align: left; width: 100%;
    }
    .agent-card:hover { border-color: var(--teal, #1e4b47); background: #f0faf9; }
    .agent-card.selected { border-color: var(--teal, #1e4b47); background: #e6f5f3; }
    .agent-card-icon { color: var(--teal, #1e4b47); font-size: 22px; width: 22px; height: 22px; }
    .agent-card-text { flex: 1; }
    .agent-card-text strong { display: block; font-size: 0.9rem; color: #2b2420; }
    .agent-card-text span { font-size: 0.78rem; color: #7a6e63; }
    .agent-card-tag {
      font-size: 0.7rem; font-weight: 600;
      background: #f4ebde; color: #c05b33;
      padding: 3px 8px; border-radius: 6px;
    }
    .agent-card-check { color: var(--teal, #1e4b47); }

    /* ── Action Buttons ── */
    .msg-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .agent-action-btn {
      border-radius: 12px !important; font-weight: 600 !important;
      font-size: 0.85rem !important;
    }
    .action-primary { background: var(--teal, #1e4b47) !important; color: #fff !important; }

    /* ── Itinerary ── */
    .itinerary-container { margin-top: 14px; }
    .itinerary-header {
      display: flex; align-items: center; gap: 8px;
      font-weight: 700; font-size: 0.95rem; color: #2b2420;
      margin-bottom: 12px;
    }
    .itinerary-day {
      border-left: 3px solid var(--teal, #1e4b47);
      margin-left: 8px; padding-left: 18px;
      margin-bottom: 16px; position: relative;
    }
    .itinerary-day::before {
      content: ''; position: absolute; left: -7px; top: 0;
      width: 11px; height: 11px; border-radius: 50%;
      background: var(--teal, #1e4b47);
    }
    .itinerary-day-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }
    .day-badge {
      background: var(--teal, #1e4b47); color: #fff;
      font-size: 0.72rem; font-weight: 700;
      padding: 3px 10px; border-radius: 8px;
    }
    .day-title { font-weight: 600; font-size: 0.9rem; color: #2b2420; }
    .day-icon { font-size: 1.2rem; margin-left: auto; }
    .day-activity {
      display: flex; align-items: flex-start; gap: 8px;
      font-size: 0.85rem; color: #3d3429; margin-bottom: 4px;
    }
    .activity-dot { font-size: 6px; width: 12px; height: 12px; margin-top: 5px; color: var(--teal); }
    .day-details { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .detail-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 0.76rem; background: #f4f1ec; color: #5c5046;
      padding: 4px 10px; border-radius: 8px;
    }
    .detail-chip mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--clay, #c05b33); }

    /* ── Plan Summary ── */
    .plan-summary-card {
      background: #fff; border: 1.5px solid #e0dbd4;
      border-radius: 18px; padding: 20px; margin-top: 14px;
    }
    .plan-summary-header {
      display: flex; align-items: center; gap: 8px;
      font-weight: 700; font-size: 1rem; color: #2b2420;
      margin-bottom: 16px;
    }
    .plan-summary-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      margin-bottom: 16px;
    }
    .summary-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; background: #f4f1ec; border-radius: 12px;
    }
    .summary-item mat-icon { color: var(--teal); }
    .summary-item strong { display: block; font-size: 0.72rem; color: #7a6e63; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-item span { font-size: 0.9rem; color: #2b2420; }
    .plan-cost-breakdown { border-top: 1px solid #e8e4de; padding-top: 14px; }
    .cost-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 0; font-size: 0.88rem; color: #5c5046;
    }
    .cost-total {
      border-top: 2px solid var(--teal); margin-top: 8px; padding-top: 10px;
      font-weight: 700; font-size: 1.05rem; color: #2b2420;
    }
    .cost-savings {
      color: #16a34a; font-weight: 600; font-size: 0.92rem;
    }

    /* ── Input Area ── */
    .agent-input-area {
      flex-shrink: 0; padding: 16px 24px 20px;
      background: #fff; border-top: 1px solid #e8e4de;
    }
    .agent-input-row {
      display: flex; align-items: center; gap: 10px;
      background: #f4f1ec; border-radius: 16px; padding: 6px 6px 6px 18px;
    }
    .agent-input {
      flex: 1; border: 0; outline: 0; background: transparent;
      font: 400 0.95rem 'Inter', sans-serif; color: #2b2420;
      padding: 10px 0;
    }
    .agent-input::placeholder { color: #a09486; }
    .agent-send-btn {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: var(--teal, #1e4b47); color: #fff;
      border: 0; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .agent-send-btn:hover { background: #153a37; }
    .agent-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .agent-quick-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .quick-chip {
      border: 1px solid #e0dbd4; background: #fff;
      color: #5c5046; font-size: 0.8rem; font-weight: 500;
      border-radius: 999px; padding: 7px 14px; cursor: pointer;
      transition: all 0.18s ease;
    }
    .quick-chip:hover { background: var(--teal, #1e4b47); border-color: var(--teal); color: #fff; }

    @media (max-width: 640px) {
      .agent-chat { padding: 16px; }
      .msg-body { max-width: 85%; }
      .plan-summary-grid { grid-template-columns: 1fr; }
      .agent-input-area { padding: 12px 16px 16px; }
    }
  `]
})
export class AiAgentComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBox') chatBox!: ElementRef<HTMLDivElement>;
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private aiService = inject(AiService);
  private router = inject(Router);

  messages: ChatMessage[] = [];
  loading = false;
  state: PlanningState = { step: 'idle' };
  private shouldScroll = false;

  quickStarts = [
    '🌴 Plan a 7-day Kerala trip',
    '🏔️ 5 days in Manali, 4 members',
    '🏖️ 3-day Goa getaway, ₹30K budget',
    '🗼 Rajasthan royal tour, 6 days',
  ];

  ngOnInit() {
    this.addAiMessage(
      `👋 **Welcome to TravelSphere AI!**\n\nI'm your personal travel planner. I can plan your entire trip — from your doorstep to the destination and back home — including flights, hotels, food, activities, and local transport.\n\nTell me where you'd like to go, or pick one below:`,
      { actions: [
        { label: 'Start Planning', icon: 'flight_takeoff', action: 'start_plan', primary: true },
        { label: 'Browse Packages', icon: 'card_giftcard', action: 'browse_packages' },
      ]}
    );
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom() {
    if (this.chatBox) {
      this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
    }
  }

  getInputPlaceholder(): string {
    switch (this.state.step) {
      case 'destination': return 'e.g., Kerala, Goa, Manali, Rajasthan...';
      case 'duration': return 'How many days? (e.g., 7)';
      case 'budget': return 'Your budget in ₹ (e.g., 50000)';
      case 'members': return 'How many travelers? (e.g., 4)';
      case 'travel_mode': return 'Type train, bus, flight, or car...';
      default: return 'Tell me where you want to go...';
    }
  }

  sendMessage(text: string) {
    if (!text?.trim() || this.loading) return;
    const content = text.trim();
    this.addUserMessage(content);
    this.shouldScroll = true;

    // Process based on current state
    setTimeout(() => this.processInput(content), 300);
  }

  processInput(content: string) {
    switch (this.state.step) {
      case 'idle':
        this.handleIdleInput(content);
        break;
      case 'destination':
        this.state.destination = content;
        this.state.step = 'duration';
        this.addAiMessage(`Great choice! **${content}** is amazing! 🌟\n\nHow many days do you have for this trip?`);
        break;
      case 'duration':
        const days = parseInt(content, 10);
        if (isNaN(days) || days < 1) {
          this.addAiMessage('Please enter a valid number of days (e.g., 7)');
          return;
        }
        this.state.duration = days;
        this.state.step = 'budget';
        this.addAiMessage(`**${days} days** — perfect! 📅\n\nWhat's your total budget in ₹? (This helps me plan hotels, transport, and activities within your range)`);
        break;
      case 'budget':
        const budget = parseInt(content.replace(/[₹,\s]/g, ''), 10);
        if (isNaN(budget) || budget < 1000) {
          this.addAiMessage('Please enter a valid budget amount in ₹ (minimum ₹1,000)');
          return;
        }
        this.state.budget = budget;
        this.state.step = 'members';
        this.addAiMessage(`Budget: **₹${budget.toLocaleString('en-IN')}** 💰\n\nHow many people are traveling? (Family, friends, or solo?)`);
        break;
      case 'members':
        const members = parseInt(content, 10);
        if (isNaN(members) || members < 1) {
          this.addAiMessage('Please enter the number of travelers (at least 1)');
          return;
        }
        this.state.members = members;
        this.state.step = 'travel_mode';
        this.addTravelModeCards();
        break;
      case 'travel_mode':
        this.handleTravelModeSelection(content);
        break;
      default:
        // Free-form chat when plan is ready
        this.handleFreeChat(content);
        break;
    }
  }

  handleIdleInput(content: string) {
    const lower = content.toLowerCase();

    // Try to extract destination from the message
    const destinations = ['kerala', 'goa', 'manali', 'rajasthan', 'himachal', 'varanasi', 'darjeeling', 'jaipur', 'udaipur', 'shimla', 'ooty', 'madurai', 'munnar', 'alleppey', 'lakshadweep'];
    const foundDest = destinations.find(d => lower.includes(d));

    if (lower.includes('plan') || lower.includes('trip') || lower.includes('holiday') || foundDest) {
      // Try to extract all info at once
      const daysMatch = content.match(/(\d+)\s*day/i);
      const budgetMatch = content.match(/₹?\s*(\d[\d,]*)/);
      const membersMatch = content.match(/(\d+)\s*(member|person|people|traveler|pax)/i);

      if (foundDest) {
        this.state.destination = foundDest.charAt(0).toUpperCase() + foundDest.slice(1);
        this.state.step = 'duration';
      }

      if (daysMatch) {
        this.state.duration = parseInt(daysMatch[1], 10);
        this.state.step = 'budget';
      }

      if (budgetMatch) {
        this.state.budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
        this.state.step = 'members';
      }

      if (membersMatch) {
        this.state.members = parseInt(membersMatch[1], 10);
        this.state.step = 'travel_mode';
      }

      // If we have enough info, skip to generation
      if (this.state.destination && this.state.duration && this.state.budget && this.state.members) {
        this.state.step = 'travel_mode';
        this.addTravelModeCards();
        return;
      }

      // Otherwise ask for missing info
      if (!this.state.destination) {
        this.addAiMessage("Sounds exciting! 🌍 Where would you like to go?\n\nTell me a destination — it could be a city, state, or country.");
        this.state.step = 'destination';
      } else if (!this.state.duration) {
        this.addAiMessage(`**${this.state.destination}** — great choice! 🌟\n\nHow many days do you have?`);
        this.state.step = 'duration';
      }
      return;
    }

    // Default: treat as destination query
    this.state.destination = content;
    this.state.step = 'duration';
    this.addAiMessage(`**${content}** — wonderful destination! 🌟\n\nHow many days do you have for this trip?`);
  }

  addTravelModeCards() {
    this.addAiMessage(
      `Perfect! Now let me know how you'd like to travel:`,
      {
        cards: [
          { title: '✈️ Flight', subtitle: 'Fastest — reach in hours', icon: 'flight', tag: 'Recommended' },
          { title: '🚂 Train', subtitle: 'Comfortable & scenic journey', icon: 'train' },
          { title: '🚌 Bus', subtitle: 'Budget-friendly option', icon: 'directions_bus' },
          { title: '🚗 Car / Self-drive', subtitle: 'Flexible & explore freely', icon: 'directions_car' },
        ],
        actions: [
          { label: 'Let AI Decide', icon: 'auto_awesome', action: 'ai_decide', primary: true },
        ]
      }
    );
  }

  handleTravelModeSelection(content: string) {
    const lower = content.toLowerCase();
    if (lower.includes('flight') || lower.includes('fly') || lower.includes('plane')) {
      this.state.travelMode = 'flight';
    } else if (lower.includes('train') || lower.includes('rail')) {
      this.state.travelMode = 'train';
    } else if (lower.includes('bus')) {
      this.state.travelMode = 'bus';
    } else if (lower.includes('car') || lower.includes('self') || lower.includes('drive')) {
      this.state.travelMode = 'car';
    } else {
      // AI decides based on distance
      this.state.travelMode = 'flight';
    }
    this.generatePlan();
  }

  handleAction(action: ChatAction) {
    switch (action.action) {
      case 'start_plan':
        this.state.step = 'destination';
        this.addAiMessage("Let's plan your trip! 🗺️\n\nWhere would you like to go? Tell me a destination — city, state, or country.");
        break;
      case 'browse_packages':
        this.router.navigate(['/packages']);
        break;
      case 'ai_decide':
        this.state.travelMode = 'flight';
        this.generatePlan();
        break;
      case 'confirm_plan':
        this.state.step = 'booking';
        this.addAiMessage("Great! Let me confirm your booking details... 📋\n\nProceeding to booking confirmation. You'll be redirected to the payment page.");
        setTimeout(() => {
          this.router.navigate(['/payments'], { queryParams: {
            trip: this.state.destination,
            days: this.state.duration,
            budget: this.state.budget,
            members: this.state.members,
          }});
        }, 1500);
        break;
      case 'modify_plan':
        this.state.step = 'duration';
        this.addAiMessage("No problem! What would you like to change?\n\n- **Duration** — how many days?\n- **Budget** — new amount?\n- **Members** — how many travelers?\n\nOr type what you'd like to modify.");
        break;
      case 'view_map':
        this.router.navigate(['/journey-tracker']);
        break;
    }
  }

  generatePlan() {
    this.state.step = 'generating';
    this.addAiMessage("🔄 Analyzing the best options for your trip...\n\n• Searching flights/trains for your route\n• Finding top-rated hotels within budget\n• Planning activities & sightseeing\n• Mapping restaurants & food options\n• Calculating door-to-door costs");

    this.loading = true;
    this.shouldScroll = true;

    // Call AI service for plan generation
    const dest = this.state.destination || 'Kerala';
    const days = this.state.duration || 7;
    const budget = this.state.budget || 50000;
    const members = this.state.members || 2;

    this.aiService.planTrip({
      destination: dest,
      durationDays: days,
      budget: budget,
      travelers: members,
      preferences: this.state.travelMode || 'flight',
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.displayPlan(response, dest, days, budget, members);
      },
      error: () => {
        this.loading = false;
        this.displayFallbackPlan(dest, days, budget, members);
      }
    });
  }

  displayPlan(response: any, dest: string, days: number, budget: number, members: number) {
    // Build itinerary from response
    const itinerary: ItineraryDay[] = (response.itinerary || []).map((item: string, i: number) => ({
      day: i + 1,
      title: `Exploring ${dest}`,
      activities: item.split('\n').filter((s: string) => s.trim()),
      icon: ['🌅', '🏛️', '🎭', '🍜', '🛍️', '🌄', '🏖️'][i % 7],
    }));

    const hotelCost = Math.floor(budget * 0.35);
    const transportCost = Math.floor(budget * 0.25);
    const foodCost = Math.floor(budget * 0.20);
    const activitiesCost = Math.floor(budget * 0.15);

    const plan: TripPlanSummary = {
      destination: dest,
      duration: days,
      members: members,
      budget: budget,
      totalCost: hotelCost + transportCost + foodCost + activitiesCost,
      hotelTotal: hotelCost,
      transportTotal: transportCost,
      foodTotal: foodCost,
      activitiesTotal: activitiesCost,
      travelMode: this.state.travelMode || 'flight',
    };

    this.state.plan = plan;
    this.state.step = 'plan_ready';

    this.addAiMessage(
      `🎉 **Your ${days}-Day ${dest} Trip is Ready!**\n\nI've crafted a personalized itinerary for ${members} traveler(s). Here's the complete plan with costs, hotels, food, and activities — all within your ₹${budget.toLocaleString('en-IN')} budget.`,
      { itinerary, planSummary: plan, actions: [
        { label: 'Confirm & Book', icon: 'check_circle', action: 'confirm_plan', primary: true },
        { label: 'Modify Plan', icon: 'edit', action: 'modify_plan' },
        { label: 'View on Map', icon: 'map', action: 'view_map' },
      ]}
    );
  }

  displayFallbackPlan(dest: string, days: number, budget: number, members: number) {
    const costPerDay = Math.floor(budget / days);
    const hotelCostPerDay = Math.floor(costPerDay * 0.40);
    const foodCostPerDay = Math.floor(costPerDay * 0.25);
    const transportCostPerDay = Math.floor(costPerDay * 0.20);
    const activityCostPerDay = Math.floor(costPerDay * 0.15);

    const destActivities: Record<string, string[]> = {
      'kerala': [
        'Arrive at Cochin Airport — private transfer to hotel in Alleppey',
        'Houseboat overnight stay in Alleppey Backwaters',
        'Morning canoe ride through narrow canals',
        'Visit Kumarakom Bird Sanctuary',
        'Drive to Munnar — tea plantation tour',
        'Eravikulam National Park — Nilgiri Tahr sighting',
        'Spice garden visit & cooking class',
      ],
      'goa': [
        'Arrive in Goa — beachside hotel check-in',
        'North Goa beach hopping (Baga, Calangute, Anjuna)',
        'Old Goa churches & heritage walk',
        'Dudhsagar Waterfalls day trip',
        'South Goa beaches & palaces',
        'Spice plantation tour & Goan cuisine class',
        'Sunset cruise on Mandovi River',
      ],
      'default': [
        `Arrive in ${dest} and check in to hotel`,
        'Explore major landmarks and attractions',
        'Cultural sightseeing & local experiences',
        'Day trip to nearby attractions',
        'Adventure activity & shopping',
        'Relaxation & local cuisine exploration',
        'Departure — transfer to airport/station',
      ]
    };

    const activities = destActivities[dest.toLowerCase()] || destActivities['default'];
    const itinerary: ItineraryDay[] = [];

    for (let i = 0; i < Math.min(days, 7); i++) {
      itinerary.push({
        day: i + 1,
        title: activities[i] || `Explore ${dest} at your own pace`,
        activities: [activities[i] || 'Free day to explore'],
        hotel: i === 0 ? `Premium Hotel in ${dest}` : undefined,
        hotelCost: i === 0 ? hotelCostPerDay * days : undefined,
        meals: 'Breakfast + Lunch + Dinner',
        mealCost: foodCostPerDay,
        transport: this.getTransportLabel(this.state.travelMode || 'flight'),
        transportCost: i === 0 ? transportCostPerDay * days : undefined,
        icon: ['🌅', '🏛️', '🎭', '🍜', '🛍️', '🌄', '✈️'][i % 7],
      });
    }

    const totalHotel = hotelCostPerDay * days;
    const totalTransport = transportCostPerDay * days;
    const totalFood = foodCostPerDay * days;
    const totalActivities = activityCostPerDay * days;

    const plan: TripPlanSummary = {
      destination: dest,
      duration: days,
      members: members,
      budget: budget,
      totalCost: totalHotel + totalTransport + totalFood + totalActivities,
      hotelTotal: totalHotel,
      transportTotal: totalTransport,
      foodTotal: totalFood,
      activitiesTotal: totalActivities,
      travelMode: this.state.travelMode || 'flight',
    };

    this.state.plan = plan;
    this.state.step = 'plan_ready';

    this.addAiMessage(
      `🎉 **Your ${days}-Day ${dest} Trip is Ready!**\n\nI've crafted a personalized itinerary for ${members} traveler(s). Here's the complete plan — all within your ₹${budget.toLocaleString('en-IN')} budget.`,
      { itinerary, planSummary: plan, actions: [
        { label: 'Confirm & Book', icon: 'check_circle', action: 'confirm_plan', primary: true },
        { label: 'Modify Plan', icon: 'edit', action: 'modify_plan' },
        { label: 'View on Map', icon: 'map', action: 'view_map' },
      ]}
    );
  }

  getTravelModeLabel(mode: string): string {
    const labels: Record<string, string> = { flight: '✈️ Flight', train: '🚂 Train', bus: '🚌 Bus', car: '🚗 Car' };
    return labels[mode] || '✈️ Flight';
  }

  getTransportLabel(mode: string): string {
    const labels: Record<string, string> = { flight: 'Flight (round trip)', train: 'AC Train (round trip)', bus: 'Volvo Bus (round trip)', car: 'Self-drive Car' };
    return labels[mode] || 'Flight';
  }

  handleFreeChat(content: string) {
    // When plan is ready, handle modification requests
    const lower = content.toLowerCase();
    if (lower.includes('change') || lower.includes('modify') || lower.includes('edit')) {
      this.handleAction({ label: '', icon: '', action: 'modify_plan' });
      return;
    }
    if (lower.includes('book') || lower.includes('confirm')) {
      this.handleAction({ label: '', icon: '', action: 'confirm_plan' });
      return;
    }
    if (lower.includes('map') || lower.includes('track')) {
      this.handleAction({ label: '', icon: '', action: 'view_map' });
      return;
    }

    // AI fallback chat
    this.addAiMessage(`I understand! For now, I can help you with:\n\n• **Modify the plan** — change duration, budget, or activities\n• **Confirm & book** — proceed to booking and payment\n• **View on map** — see your trip on an interactive map\n\nWhat would you like to do?`);
  }

  selectCard(msg: ChatMessage, card: TripCard) {
    if (!msg.cards) return;
    msg.cards.forEach(c => c.selected = false);
    card.selected = true;
    this.shouldScroll = true;
    setTimeout(() => {
      if (card.title.includes('Flight')) this.handleTravelModeSelection('flight');
      else if (card.title.includes('Train')) this.handleTravelModeSelection('train');
      else if (card.title.includes('Bus')) this.handleTravelModeSelection('bus');
      else if (card.title.includes('Car')) this.handleTravelModeSelection('car');
    }, 200);
  }

  addUserMessage(content: string) {
    this.messages.push({ role: 'user', content, timestamp: new Date() });
  }

  addAiMessage(content: string, options?: { cards?: TripCard[]; itinerary?: ItineraryDay[]; planSummary?: TripPlanSummary; actions?: ChatAction[] }) {
    this.messages.push({
      role: 'assistant',
      content,
      timestamp: new Date(),
      cards: options?.cards,
      itinerary: options?.itinerary,
      planSummary: options?.planSummary,
      actions: options?.actions,
    });
    this.shouldScroll = true;
  }

  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  clearChat() {
    this.messages = [];
    this.state = { step: 'idle' };
    this.ngOnInit();
  }
}
