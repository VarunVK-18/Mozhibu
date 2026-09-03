const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../../Frontend/src/app/features/write/chapter-editor.component.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace the HTML for the select
const oldHtml = `<select [(ngModel)]="accessType" class="input-field" (ngModelChange)="onContentChange()">
                  <option value="inherit">Follow Book Settings</option>
                  <option value="free">Free for Everyone</option>
                  <option value="premium" [disabled]="!isPremiumAllowed">Premium (Subscribers Only)</option>
                </select>
                <div *ngIf="!isPremiumAllowed" class="hint-text">Premium access available for Chapter 6 and beyond.</div>`;

const newHtml = `<select #accessSelect [ngModel]="accessType" class="input-field" (ngModelChange)="onAccessChange($event, accessSelect)">
                  <option value="inherit">Follow Book Settings</option>
                  <option value="free">Free for Everyone</option>
                  <option value="premium">Premium (Subscribers Only)</option>
                </select>
                <div *ngIf="!isPremiumAllowed" class="hint-text">Premium access available for Chapter 6 and beyond.</div>
                @if (accessErrorMessage) {
                  <div class="popup-message">{{ accessErrorMessage }}</div>
                }`;

content = content.replace(oldHtml, newHtml);

// Add popup-message style
const oldStyle = `.hint-text { font-size: 12px; color: var(--text-secondary); }`;
const newStyle = `.hint-text { font-size: 12px; color: var(--text-secondary); }
      .popup-message {
        font-size: 12px;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid rgba(239, 68, 68, 0.2);
        margin-top: 4px;
        animation: fadeIn 0.2s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }`;

content = content.replace(oldStyle, newStyle);

// Add the logic method
const newLogic = `
  accessErrorMessage = '';
  
  onAccessChange(newVal: string, selectElement: HTMLSelectElement) {
    if (newVal === 'premium' && !this.isPremiumAllowed) {
      this.accessErrorMessage = 'Premium content can only be activated for Chapter 6 and beyond to ensure readers get enough free content first!';
      // Revert the dropdown visually
      selectElement.value = this.accessType;
      
      // Auto-hide the message after 4 seconds
      setTimeout(() => {
        this.accessErrorMessage = '';
      }, 4000);
      return;
    }
    
    this.accessErrorMessage = '';
    this.accessType = newVal;
    this.onContentChange();
  }
`;

content = content.replace(/(export class ChapterEditorComponent implements OnInit \{)/, `$1${newLogic}`);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Added popup message logic.");
