import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf, NgClass, DatePipe, JsonPipe } from '@angular/common';
import { N8nService, WebhookConfig, WebhookDelivery, WebhookStats } from '../../../services/n8n.service';

@Component({
  selector: 'app-n8n-workflows',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatIconModule, MatCardModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatTabsModule, MatSlideToggleModule, MatChipsModule,
    MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, NgFor, NgIf, NgClass, DatePipe, JsonPipe
  ],
  template: `
    <div class="n8n-container">
      <!-- Header -->
      <div class="n8n-header">
        <div class="n8n-header-inner">
          <div>
            <h1><mat-icon>hub</mat-icon> n8n Workflow Manager</h1>
            <p>Manage webhook integrations and monitor automation flows</p>
          </div>
          <div class="n8n-header-actions">
            <button mat-stroked-button (click)="refreshAll()">
              <mat-icon>refresh</mat-icon> Refresh
            </button>
            <button mat-raised-button color="primary" class="cta-button" (click)="showCreateForm = !showCreateForm">
              <mat-icon>add</mat-icon> New Webhook
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="n8n-stats">
        <div class="stat-card">
          <mat-icon>webhook</mat-icon>
          <div class="stat-value">{{ configs.length }}</div>
          <div class="stat-label">Active Webhooks</div>
        </div>
        <div class="stat-card success">
          <mat-icon>check_circle</mat-icon>
          <div class="stat-value">{{ stats.totalDelivered }}</div>
          <div class="stat-label">Successful Deliveries</div>
        </div>
        <div class="stat-card error">
          <mat-icon>error</mat-icon>
          <div class="stat-value">{{ stats.totalFailed }}</div>
          <div class="stat-label">Failed Deliveries</div>
        </div>
        <div class="stat-card info">
          <mat-icon>speed</mat-icon>
          <div class="stat-value">{{ stats.totalDelivered + stats.totalFailed > 0 ? ((stats.totalDelivered / (stats.totalDelivered + stats.totalFailed)) * 100).toFixed(1) : 0 }}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>

      <div class="n8n-content">
        <mat-tab-group>
          <!-- Tab 1: Webhook Configs -->
          <mat-tab>
            <ng-template mat-tab-label><mat-icon>settings</mat-icon> Webhooks</ng-template>
            <div class="tab-content">
              <!-- Create Form -->
              <mat-card *ngIf="showCreateForm" class="create-form-card">
                <h3>{{ editingId ? 'Edit Webhook' : 'Create New Webhook' }}</h3>
                <form [formGroup]="webhookForm" (ngSubmit)="saveWebhook()">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Name</mat-label>
                      <input matInput formControlName="name" placeholder="e.g., Booking Confirmation" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Event Type</mat-label>
                      <mat-select formControlName="eventType">
                        <mat-option value="BOOKING_CREATED">Booking Created</mat-option>
                        <mat-option value="PAYMENT_COMPLETED">Payment Completed</mat-option>
                        <mat-option value="PAYMENT_FAILED">Payment Failed</mat-option>
                        <mat-option value="REFUND_PROCESSED">Refund Processed</mat-option>
                        <mat-option value="JOURNEY_STARTED">Journey Started</mat-option>
                        <mat-option value="JOURNEY_UPDATE">Journey Update</mat-option>
                        <mat-option value="JOURNEY_COMPLETED">Journey Completed</mat-option>
                        <mat-option value="FOOD_ORDERED">Food Ordered</mat-option>
                        <mat-option value="CUSTOM">Custom</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <mat-form-field class="full-width" appearance="outline">
                    <mat-label>n8n Webhook URL</mat-label>
                    <input matInput formControlName="webhookUrl" placeholder="https://your-n8n-instance.com/webhook/travelsphere/..." />
                    <mat-hint>The URL n8n will listen on (from the Webhook node)</mat-hint>
                  </mat-form-field>
                  <mat-form-field class="full-width" appearance="outline">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="2" placeholder="What this webhook does..."></textarea>
                  </mat-form-field>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Retry Count</mat-label>
                      <input matInput type="number" formControlName="retryCount" min="1" max="5" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Timeout (seconds)</mat-label>
                      <input matInput type="number" formControlName="timeoutSeconds" min="5" max="60" />
                    </mat-form-field>
                  </div>
                  <mat-form-field class="full-width" appearance="outline">
                    <mat-label>HMAC Secret (optional)</mat-label>
                    <input matInput formControlName="secretHmac" placeholder="Shared secret for signature verification" />
                  </mat-form-field>
                  <div class="form-actions">
                    <mat-slide-toggle formControlName="active">Active</mat-slide-toggle>
                    <div>
                      <button mat-button type="button" (click)="cancelEdit()">Cancel</button>
                      <button mat-raised-button color="primary" type="submit" [disabled]="webhookForm.invalid">
                        {{ editingId ? 'Update' : 'Create' }}
                      </button>
                    </div>
                  </div>
                </form>
              </mat-card>

              <!-- Webhook List -->
              <div class="webhook-list">
                <mat-card *ngFor="let config of configs" class="webhook-card" [class.inactive]="!config.active">
                  <div class="webhook-card-header">
                    <div class="webhook-info">
                      <div class="webhook-name">
                        <span class="event-badge" [class]="'event-' + config.eventType.toLowerCase().replace('_', '-')">
                          {{ config.eventType }}
                        </span>
                        <strong>{{ config.name }}</strong>
                      </div>
                      <span class="webhook-url">{{ config.webhookUrl }}</span>
                      <span *ngIf="config.description" class="webhook-desc">{{ config.description }}</span>
                    </div>
                    <div class="webhook-actions">
                      <mat-slide-toggle [checked]="config.active" (change)="toggleActive(config)"></mat-slide-toggle>
                      <button mat-icon-button (click)="editWebhook(config)" title="Edit">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="testWebhook(config)" title="Test" color="primary">
                        <mat-icon>send</mat-icon>
                      </button>
                      <button mat-icon-button (click)="deleteWebhook(config)" title="Delete" color="warn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                  <div class="webhook-meta">
                    <span>Retry: {{ config.retryCount }}x</span>
                    <span>Timeout: {{ config.timeoutSeconds }}s</span>
                    <span *ngIf="config.secretHmac">🔒 HMAC Signed</span>
                  </div>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Delivery Logs -->
          <mat-tab>
            <ng-template mat-tab-label><mat-icon>receipt_long</mat-icon> Delivery Logs</ng-template>
            <div class="tab-content">
              <div class="delivery-filters">
                <mat-form-field appearance="outline">
                  <mat-label>Filter by Event</mat-label>
                  <mat-select (selectionChange)="filterDeliveries($event.value)">
                    <mat-option value="">All Events</mat-option>
                    <mat-option value="BOOKING_CREATED">Booking Created</mat-option>
                    <mat-option value="PAYMENT_COMPLETED">Payment Completed</mat-option>
                    <mat-option value="JOURNEY_UPDATE">Journey Update</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="delivery-list">
                <mat-card *ngFor="let delivery of deliveries" class="delivery-card">
                  <div class="delivery-header">
                    <span class="delivery-status" [class]="delivery.success ? 'status-success' : 'status-failed'">
                      <mat-icon>{{ delivery.success ? 'check_circle' : 'error' }}</mat-icon>
                      {{ delivery.success ? 'Delivered' : 'Failed' }}
                    </span>
                    <span class="delivery-event">{{ delivery.eventType }}</span>
                    <span class="delivery-time">{{ delivery.sentAt | date:'medium' }}</span>
                    <span class="delivery-code">HTTP {{ delivery.statusCode }}</span>
                  </div>
                  <div class="delivery-details" *ngIf="expandedDelivery === delivery.id">
                    <div class="detail-section">
                      <strong>Payload</strong>
                      <pre>{{ delivery.payload | json }}</pre>
                    </div>
                    <div class="detail-section" *ngIf="delivery.response">
                      <strong>Response</strong>
                      <pre>{{ delivery.response }}</pre>
                    </div>
                    <div class="detail-section error" *ngIf="delivery.errorMessage">
                      <strong>Error</strong>
                      <pre>{{ delivery.errorMessage }}</pre>
                    </div>
                    <div class="delivery-meta">
                      <span>Attempt: {{ delivery.attempt }}</span>
                      <span *ngIf="delivery.completedAt">Completed: {{ delivery.completedAt | date:'medium' }}</span>
                    </div>
                  </div>
                  <button mat-button class="expand-btn" (click)="toggleDeliveryExpand(delivery.id)">
                    {{ expandedDelivery === delivery.id ? 'Less' : 'Details' }}
                    <mat-icon>{{ expandedDelivery === delivery.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                  </button>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 3: Workflow Templates -->
          <mat-tab>
            <ng-template mat-tab-label><mat-icon>account_tree</mat-icon> Workflows</ng-template>
            <div class="tab-content">
              <div class="workflow-grid">
                <mat-card *ngFor="let wf of workflowTemplates" class="workflow-card">
                  <div class="workflow-icon" [style.background]="wf.color">{{ wf.icon }}</div>
                  <h3>{{ wf.name }}</h3>
                  <p>{{ wf.description }}</p>
                  <div class="workflow-events">
                    <span class="event-tag" *ngFor="let e of wf.events">{{ e }}</span>
                  </div>
                  <div class="workflow-actions">
                    <button mat-stroked-button (click)="importWorkflow(wf)">
                      <mat-icon>download</mat-icon> Import to n8n
                    </button>
                  </div>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 4: Setup Guide -->
          <mat-tab>
            <ng-template mat-tab-label><mat-icon>help</mat-icon> Setup Guide</ng-template>
            <div class="tab-content">
              <mat-card class="guide-card">
                <h2>🚀 n8n Integration Setup Guide</h2>

                <div class="guide-step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>Install n8n</h4>
                    <pre>docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n</pre>
                    <p>Access n8n at <code>http://localhost:5678</code></p>
                  </div>
                </div>

                <div class="guide-step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>Import Workflow Templates</h4>
                    <p>Go to <strong>Workflows → Import from File</strong> and import the JSON files from:</p>
                    <pre>config-repo/n8n-workflows/*.json</pre>
                    <ul>
                      <li><strong>booking-confirmation-flow.json</strong> — Sends email + SMS on new bookings</li>
                      <li><strong>payment-processing-flow.json</strong> — Triggers after payment success</li>
                      <li><strong>journey-tracking-flow.json</strong> — Live updates during journey</li>
                    </ul>
                  </div>
                </div>

                <div class="guide-step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>Activate the Webhook Node</h4>
                    <p>After importing, click the <strong>Webhook Trigger</strong> node in each workflow and note the URL (e.g., <code>http://localhost:5678/webhook/travelsphere/booking-confirmation</code>).</p>
                    <p>Copy this URL into the webhook config above.</p>
                  </div>
                </div>

                <div class="guide-step">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <h4>Register Webhooks in TravelSphere</h4>
                    <p>Use the "New Webhook" button above to register each n8n webhook URL with the corresponding event type.</p>
                    <p>The TravelSphere backend will automatically dispatch events to n8n when bookings, payments, or journey updates occur.</p>
                  </div>
                </div>

                <div class="guide-step">
                  <div class="step-number">5</div>
                  <div class="step-content">
                    <h4>Configure n8n Credentials</h4>
                    <p>In n8n, set up these credentials under <strong>Settings → Credentials</strong>:</p>
                    <ul>
                      <li><strong>SMTP</strong> — For sending confirmation emails</li>
                      <li><strong>HTTP Request</strong> — For calling TravelSphere APIs</li>
                      <li><strong>Twilio</strong> — For SMS notifications (optional)</li>
                    </ul>
                  </div>
                </div>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #faf8f5; min-height: 100vh; }

    .n8n-container { max-width: 1200px; margin: 0 auto; }

    /* ── Header ── */
    .n8n-header {
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      padding: 32px 24px; color: #fff;
    }
    .n8n-header-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .n8n-header h1 { font-size: 1.4rem; display: flex; align-items: center; gap: 10px; margin: 0; }
    .n8n-header p { font-size: 0.88rem; opacity: 0.85; margin: 4px 0 0; }
    .n8n-header-actions { display: flex; gap: 10px; }
    .n8n-header-actions button { color: #fff !important; border-color: rgba(255,255,255,0.5) !important; }
    .n8n-header-actions .cta-button { background: #fff !important; color: #7c3aed !important; }

    /* ── Stats ── */
    .n8n-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
      padding: 24px;
    }
    .stat-card {
      background: #fff; border-radius: 16px; padding: 20px;
      text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .stat-card mat-icon { font-size: 28px; width: 28px; height: 28px; color: #7c3aed; }
    .stat-card.success mat-icon { color: #16a34a; }
    .stat-card.error mat-icon { color: #dc2626; }
    .stat-card.info mat-icon { color: #2563eb; }
    .stat-value { font-size: 2rem; font-weight: 700; color: #2b2420; margin: 8px 0 4px; }
    .stat-label { font-size: 0.8rem; color: #7a6e63; }

    /* ── Content ── */
    .n8n-content { padding: 0 24px 40px; }
    .tab-content { padding: 24px 0; }

    /* ── Create Form ── */
    .create-form-card { padding: 24px; margin-bottom: 24px; border-radius: 16px; }
    .create-form-card h3 { margin: 0 0 16px; color: #2b2420; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
    .form-actions div { display: flex; gap: 10px; }

    /* ── Webhook Cards ── */
    .webhook-list { display: flex; flex-direction: column; gap: 12px; }
    .webhook-card { border-radius: 14px !important; padding: 16px 20px !important; }
    .webhook-card.inactive { opacity: 0.6; }
    .webhook-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .webhook-info { flex: 1; }
    .webhook-name { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .webhook-name strong { font-size: 0.95rem; }
    .event-badge {
      font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;
      background: #f3e8ff; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .event-badge.event-booking-created { background: #dbeafe; color: #2563eb; }
    .event-badge.event-payment-completed { background: #dcfce7; color: #16a34a; }
    .event-badge.event-payment-failed { background: #fee2e2; color: #dc2626; }
    .event-badge.event-journey-update { background: #fef3c7; color: #d97706; }
    .event-badge.event-journey-started { background: #fef3c7; color: #d97706; }
    .event-badge.event-journey-completed { background: #dcfce7; color: #16a34a; }
    .event-badge.event-refund-processed { background: #fce7f3; color: #db2777; }
    .event-badge.event-food-ordered { background: #ffedd5; color: #ea580c; }
    .webhook-url { font-size: 0.78rem; color: #7a6e63; display: block; font-family: monospace; }
    .webhook-desc { font-size: 0.82rem; color: #5c5046; display: block; margin-top: 4px; }
    .webhook-actions { display: flex; align-items: center; gap: 4px; }
    .webhook-meta { display: flex; gap: 16px; margin-top: 10px; font-size: 0.76rem; color: #a09486; }

    /* ── Delivery Logs ── */
    .delivery-filters { margin-bottom: 16px; }
    .delivery-list { display: flex; flex-direction: column; gap: 10px; }
    .delivery-card { border-radius: 12px !important; padding: 14px 18px !important; }
    .delivery-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .delivery-status { display: flex; align-items: center; gap: 4px; font-size: 0.82rem; font-weight: 600; }
    .delivery-status mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .status-success { color: #16a34a; }
    .status-failed { color: #dc2626; }
    .delivery-event { font-size: 0.78rem; background: #f3e8ff; color: #7c3aed; padding: 2px 8px; border-radius: 6px; }
    .delivery-time { font-size: 0.78rem; color: #7a6e63; }
    .delivery-code { font-size: 0.76rem; color: #a09486; font-family: monospace; }
    .expand-btn { font-size: 0.8rem !important; }
    .delivery-details { margin-top: 12px; }
    .detail-section { margin-bottom: 12px; }
    .detail-section strong { font-size: 0.82rem; color: #5c5046; display: block; margin-bottom: 4px; }
    .detail-section pre {
      background: #f4f1ec; padding: 12px; border-radius: 8px; font-size: 0.75rem;
      overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto;
    }
    .detail-section.error pre { background: #fee2e2; color: #dc2626; }
    .delivery-meta { display: flex; gap: 16px; font-size: 0.75rem; color: #a09486; }

    /* ── Workflow Templates ── */
    .workflow-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .workflow-card { border-radius: 16px !important; padding: 24px !important; text-align: center; }
    .workflow-icon { font-size: 2.5rem; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .workflow-card h3 { font-size: 1.05rem; margin: 0 0 8px; }
    .workflow-card p { font-size: 0.85rem; color: #5c5046; margin: 0 0 12px; }
    .workflow-events { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 16px; }
    .event-tag { font-size: 0.7rem; background: #f3e8ff; color: #7c3aed; padding: 3px 8px; border-radius: 6px; }
    .workflow-actions button { font-size: 0.85rem; }

    /* ── Guide ── */
    .guide-card { padding: 32px; border-radius: 16px; }
    .guide-card h2 { margin: 0 0 28px; color: #2b2420; }
    .guide-step {
      display: flex; gap: 16px; margin-bottom: 24px;
      padding-bottom: 24px; border-bottom: 1px solid #f0ebe5;
    }
    .guide-step:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .step-number {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: #7c3aed; color: #fff; font-weight: 700; font-size: 0.9rem;
      display: flex; align-items: center; justify-content: center;
    }
    .step-content h4 { margin: 0 0 8px; color: #2b2420; }
    .step-content p { font-size: 0.88rem; color: #5c5046; margin: 0 0 8px; }
    .step-content pre {
      background: #f4f1ec; padding: 12px; border-radius: 8px; font-size: 0.78rem;
      overflow-x: auto; margin: 8px 0;
    }
    .step-content code { background: #f4f1ec; padding: 2px 6px; border-radius: 4px; font-size: 0.82rem; }
    .step-content ul { font-size: 0.85rem; color: #5c5046; padding-left: 20px; }
    .step-content li { margin-bottom: 4px; }

    @media (max-width: 768px) {
      .n8n-stats { grid-template-columns: repeat(2, 1fr); }
      .form-grid { grid-template-columns: 1fr; }
      .workflow-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class N8nWorkflowsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private n8nService = inject(N8nService);

  configs: WebhookConfig[] = [];
  deliveries: WebhookDelivery[] = [];
  stats: WebhookStats = { totalDelivered: 0, totalFailed: 0 };
  showCreateForm = false;
  editingId: string | null = null;
  expandedDelivery: string | null = null;

  workflowTemplates = [
    {
      name: 'Booking Confirmation',
      icon: '✅',
      color: 'linear-gradient(135deg, #22c55e, #16a34a)',
      description: 'Automatically sends confirmation email + SMS when a booking is created.',
      events: ['BOOKING_CREATED'],
      file: 'booking-confirmation-flow.json'
    },
    {
      name: 'Payment Processing',
      icon: '💳',
      color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      description: 'Sends payment receipt email and triggers in-app notification after payment.',
      events: ['PAYMENT_COMPLETED', 'PAYMENT_FAILED'],
      file: 'payment-processing-flow.json'
    },
    {
      name: 'Journey Tracking',
      icon: '🗺️',
      color: 'linear-gradient(135deg, #f59e0b, #d97706)',
      description: 'Sends live push notifications as the traveler reaches each waypoint.',
      events: ['JOURNEY_STARTED', 'JOURNEY_UPDATE', 'JOURNEY_COMPLETED'],
      file: 'journey-tracking-flow.json'
    },
  ];

  webhookForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    webhookUrl: ['', Validators.required],
    eventType: ['BOOKING_CREATED', Validators.required],
    description: [''],
    active: [true],
    retryCount: [3],
    timeoutSeconds: [30],
    secretHmac: [''],
  });

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    this.n8nService.getConfigs().subscribe(configs => this.configs = configs);
    this.n8nService.getStats().subscribe(stats => this.stats = stats);
    this.n8nService.getDeliveries().subscribe(d => this.deliveries = d.content || []);
  }

  saveWebhook() {
    const formValue = this.webhookForm.getRawValue();
    if (this.editingId) {
      this.n8nService.updateConfig(this.editingId, formValue).subscribe(() => {
        this.cancelEdit();
        this.refreshAll();
      });
    } else {
      this.n8nService.createConfig(formValue).subscribe(() => {
        this.cancelEdit();
        this.refreshAll();
      });
    }
  }

  editWebhook(config: WebhookConfig) {
    this.editingId = config.id;
    this.showCreateForm = true;
    this.webhookForm.patchValue(config);
  }

  cancelEdit() {
    this.showCreateForm = false;
    this.editingId = null;
    this.webhookForm.reset({ active: true, retryCount: 3, timeoutSeconds: 30, eventType: 'BOOKING_CREATED' });
  }

  deleteWebhook(config: WebhookConfig) {
    if (confirm(`Delete webhook "${config.name}"?`)) {
      this.n8nService.deleteConfig(config.id).subscribe(() => this.refreshAll());
    }
  }

  toggleActive(config: WebhookConfig) {
    this.n8nService.updateConfig(config.id, {
      ...config,
      active: !config.active,
    } as any).subscribe(() => this.refreshAll());
  }

  testWebhook(config: WebhookConfig) {
    const testEvent = {
      eventType: config.eventType,
      source: 'test-dispatch',
      bookingRef: 'TS-TEST-' + Date.now(),
      data: {
        destination: 'Kerala',
        travelDate: '2026-09-15',
        totalAmount: 45000,
        travelers: 2,
        finalAmount: 45000,
        currency: 'INR',
        paymentMethod: 'UPI',
      }
    };
    this.n8nService.dispatchEvent(testEvent).subscribe(() => {
      alert('Test webhook dispatched! Check delivery logs.');
      this.refreshAll();
    });
  }

  filterDeliveries(eventType: string) {
    if (eventType) {
      this.n8nService.getDeliveriesByEvent(eventType).subscribe(d => this.deliveries = d.content || []);
    } else {
      this.n8nService.getDeliveries().subscribe(d => this.deliveries = d.content || []);
    }
  }

  toggleDeliveryExpand(id: string) {
    this.expandedDelivery = this.expandedDelivery === id ? null : id;
  }

  importWorkflow(wf: any) {
    alert(`Import "${wf.name}" workflow into n8n:\n\n1. Open n8n at http://localhost:5678\n2. Go to Workflows → Import from File\n3. Select: config-repo/n8n-workflows/${wf.file}`);
  }
}
