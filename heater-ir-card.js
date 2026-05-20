import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class HeaterIrCard extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _activeWatt: { type: Number },
    };
  }

  constructor() {
    super();
    this._activeWatt = 0;
  }

  setConfig(config) {
    if (!config.heater_switch) {
      throw new Error("חובה להגדיר heater_switch");
    }
    this.config = {
      name: "תנור חימום",
      heater_switch: null,
      btn_1000w: null,
      btn_2000w: null,
      btn_3000w: null,
      btn_timer: null,
      btn_sync: null,
      ...config,
    };
  }

  static getConfigElement() {
    return document.createElement("heater-ir-card-editor");
  }

  static getStubConfig() {
    return {
      name: "תנור חימום",
      heater_switch: "switch.ir_blaster_remote_תנור_חימום",
      btn_1000w: "button.ir_blaster_remote_תנור_1000w",
      btn_2000w: "button.ir_blaster_remote_תנור_2000w",
      btn_3000w: "button.ir_blaster_remote_תנור_3000w",
      btn_timer: "button.ir_blaster_remote_תנור_טיימר",
      btn_sync: "button.ir_blaster_remote_תנור_סנכרון_מצב",
    };
  }

  get _isDark() {
    return this.hass?.themes?.darkMode ?? false;
  }

  get _isOn() {
    if (!this.config?.heater_switch || !this.hass) return false;
    return this.hass.states[this.config.heater_switch]?.state === "on";
  }

  get _heatPercent() {
    if (!this._isOn) return 0;
    if (this._activeWatt === 1000) return 33;
    if (this._activeWatt === 2000) return 66;
    if (this._activeWatt === 3000) return 100;
    return 20;
  }

  get _wattLabel() {
    if (!this._isOn) return "כבוי";
    if (this._activeWatt) return `${this._activeWatt}W`;
    return "פועל";
  }

  _callSwitch() {
    const state = this._isOn ? "turn_off" : "turn_on";
    this.hass.callService("switch", state, {
      entity_id: this.config.heater_switch,
    });
  }

  _pressButton(entityId) {
    if (!entityId || !this.hass) return;
    this.hass.callService("button", "press", { entity_id: entityId });
  }

  _selectWatt(w, entityKey) {
    this._activeWatt = w;
    this._pressButton(this.config[entityKey]);
  }

  static get styles() {
    return css`
      :host {
        display: block;
        --card-radius: 16px;
        --border-radius: 18px;
      }

      /* ── SPINNING BORDER WRAPPER ── */
      .card-outer {
        position: relative;
        padding: 3px;
        border-radius: var(--border-radius);
        overflow: hidden;
      }
      .border-spin {
        position: absolute;
        inset: 0;
        border-radius: var(--border-radius);
        animation: spin 3s linear infinite;
      }
      .border-day {
        background: conic-gradient(
          from 0deg,
          #ff4500 0%,
          #ffaa00 25%,
          #ff6500 50%,
          #ffaa00 75%,
          #ff4500 100%
        );
      }
      .border-night {
        background: conic-gradient(
          from 0deg,
          #1e40af 0%,
          #7c3aed 25%,
          #1e40af 50%,
          #a78bfa 75%,
          #1e40af 100%
        );
        animation-duration: 4s;
      }

      /* ── INNER CARD ── */
      .card-inner {
        position: relative;
        z-index: 1;
        border-radius: var(--card-radius);
        padding: 14px;
        overflow: hidden;
      }
      .card-day { background: #ffffff; }
      .card-night { background: #1e1e2e; }

      /* ── LED STRIP ── */
      .led-strip {
        height: 3px;
        border-radius: 2px;
        background-size: 200% 100%;
        animation: shimmer 1.5s linear infinite;
        margin-bottom: 12px;
      }
      .led-day {
        background: linear-gradient(
          90deg, #ff4500, #ffaa00, #ff6500, #ffaa00, #ff4500
        );
      }
      .led-night {
        background: linear-gradient(
          90deg, #1e40af, #7c3aed, #a78bfa, #7c3aed, #1e40af
        );
        animation-duration: 2s;
      }

      /* ── STARS ── */
      .star {
        position: absolute;
        width: 2px;
        height: 2px;
        background: white;
        border-radius: 50%;
        animation: twinkle 2s infinite;
      }

      /* ── HEADER ── */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .header-left { display: flex; align-items: center; gap: 8px; }
      .fire-icon { font-size: 28px; line-height: 1; }

      .title-day  { font-size: 15px; font-weight: 700; color: #1f2937; margin: 0; }
      .title-night { font-size: 15px; font-weight: 700; color: #ffffff; margin: 0; }
      .sub-day   { font-size: 11px; color: #6b7280; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
      .sub-night { font-size: 11px; color: #94a3b8; margin-top: 2px; display: flex; align-items: center; gap: 4px; }

      .dot-on {
        display: inline-block; width: 7px; height: 7px;
        border-radius: 50%; background: #22c55e;
        animation: pulse 1.2s infinite;
      }
      .dot-off {
        display: inline-block; width: 7px; height: 7px;
        border-radius: 50%; background: #9ca3af;
      }

      /* ── TOGGLE ── */
      .toggle {
        width: 44px; height: 25px;
        border-radius: 13px;
        border: none;
        cursor: pointer;
        position: relative;
        transition: background 0.25s;
        flex-shrink: 0;
      }
      .toggle-on  { background: #ef4444; }
      .toggle-off-day   { background: #e5e7eb; }
      .toggle-off-night { background: #334155; }
      .knob {
        position: absolute;
        width: 19px; height: 19px;
        background: white;
        border-radius: 50%;
        top: 3px;
        transition: left 0.25s;
      }
      .knob-on  { left: calc(100% - 22px); }
      .knob-off { left: 3px; }

      /* ── HEAT BAR ── */
      .heat-section { margin-bottom: 12px; }
      .heat-meta {
        font-size: 10px;
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .heat-meta-day  { color: #6b7280; }
      .heat-meta-night { color: #94a3b8; }
      .heat-bg-day  { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
      .heat-bg-night { height: 8px; background: #334155; border-radius: 4px; overflow: hidden; }
      .heat-fill {
        height: 100%;
        border-radius: 4px;
        background: linear-gradient(90deg, #fbbf24, #f97316, #ef4444);
        transition: width 0.4s ease;
      }

      /* ── WATT BUTTONS GRID ── */
      .section-label {
        font-size: 10px; font-weight: 600;
        letter-spacing: 0.03em;
        margin-bottom: 6px;
      }
      .section-label-day  { color: #6b7280; }
      .section-label-night { color: #94a3b8; }

      .watt-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin-bottom: 8px;
      }

      .watt-btn {
        border-radius: 10px;
        padding: 8px 4px;
        text-align: center;
        cursor: pointer;
        border: none;
        transition: all 0.15s;
        background: none;
        width: 100%;
      }
      .watt-btn:active { transform: scale(0.96); }

      .watt-day         { background: #f9fafb; border: 1.5px solid #d1d5db; }
      .watt-day.active  { background: #fff7ed; border-color: #f97316; }
      .watt-night       { background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.2); }
      .watt-night.active { background: rgba(249,115,22,0.2); border-color: #f97316; }

      .wlabel { display: block; font-size: 11px; font-weight: 700; }
      .wlabel-day        { color: #111827; }
      .wlabel-day.active { color: #c2410c; }
      .wlabel-night        { color: #ffffff; }
      .wlabel-night.active { color: #fb923c; }

      .wsub { display: block; font-size: 9px; margin-top: 2px; }
      .wsub-day        { color: #9ca3af; }
      .wsub-day.active { color: #f97316; }
      .wsub-night        { color: #94a3b8; }
      .wsub-night.active { color: #fdba74; }

      /* ── BOTTOM BUTTONS ── */
      .bottom-row { display: flex; gap: 6px; }
      .bottom-btn {
        flex: 1;
        border-radius: 9px;
        font-size: 11px;
        font-weight: 700;
        padding: 8px 6px;
        text-align: center;
        cursor: pointer;
        border: none;
        background: none;
        transition: opacity 0.15s;
      }
      .bottom-btn:active { opacity: 0.7; }

      .bottom-day   { background: #f3f4f6; border: 1.5px solid #d1d5db; color: #374151; }
      .bottom-night { background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.25); color: #ffffff; }

      /* ── ANIMATIONS ── */
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes shimmer {
        0%   { background-position: 0% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.3; }
      }
      @keyframes twinkle {
        0%, 100% { opacity: 0.9; }
        50%       { opacity: 0.1; }
      }
    `;
  }

  _renderWattBtn(label, sub, icon, watt, entityKey, mode) {
    const isActive = this._activeWatt === watt && this._isOn;
    const d = mode === "day";
    return html`
      <button
        class="watt-btn ${d ? "watt-day" : "watt-night"} ${isActive ? "active" : ""}"
        @click=${() => this._selectWatt(watt, entityKey)}
        title="${label}"
      >
        <span class="wlabel ${d ? "wlabel-day" : "wlabel-night"} ${isActive ? "active" : ""}">
          ${icon} ${label}
        </span>
        <span class="wsub ${d ? "wsub-day" : "wsub-night"} ${isActive ? "active" : ""}">
          ${sub}
        </span>
      </button>
    `;
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const dark = this._isDark;
    const on = this._isOn;
    const m = dark ? "night" : "day";

    const stars = dark
      ? html`
          <div class="star" style="top:12%;left:75%;animation-delay:0s"></div>
          <div class="star" style="top:35%;left:87%;animation-delay:0.8s"></div>
          <div class="star" style="top:60%;left:80%;animation-delay:1.5s"></div>
          <div class="star" style="top:22%;left:92%;animation-delay:0.4s"></div>
        `
      : html``;

    return html`
      <div class="card-outer">
        <div class="border-spin ${dark ? "border-night" : "border-day"}"></div>

        <div class="card-inner ${dark ? "card-night" : "card-day"}">
          ${stars}
          <div class="led-strip ${dark ? "led-night" : "led-day"}"></div>

          <!-- HEADER -->
          <div class="header">
            <div class="header-left">
              <div class="fire-icon">${on ? "🔥" : dark ? "🌙" : "🌡"}</div>
              <div>
                <div class="${dark ? "title-night" : "title-day"}">
                  ${this.config.name}
                </div>
                <div class="${dark ? "sub-night" : "sub-day"}">
                  <span class="${on ? "dot-on" : "dot-off"}"></span>
                  IR Blaster · ${this._wattLabel}
                </div>
              </div>
            </div>
            <button
              class="toggle ${on ? "toggle-on" : dark ? "toggle-off-night" : "toggle-off-day"}"
              @click=${this._callSwitch}
              title="${on ? "כבה תנור" : "הפעל תנור"}"
            >
              <div class="knob ${on ? "knob-on" : "knob-off"}"></div>
            </button>
          </div>

          <!-- HEAT BAR -->
          <div class="heat-section">
            <div class="heat-meta ${dark ? "heat-meta-night" : "heat-meta-day"}">
              <span>עוצמת חימום</span>
              <span>${this._wattLabel}</span>
            </div>
            <div class="${dark ? "heat-bg-night" : "heat-bg-day"}">
              <div class="heat-fill" style="width:${this._heatPercent}%"></div>
            </div>
          </div>

          <!-- WATT BUTTONS -->
          <div class="section-label ${dark ? "section-label-night" : "section-label-day"}">
            בחר עוצמה
          </div>
          <div class="watt-grid">
            ${this._renderWattBtn("1000W", "חימום נמוך",  "🌡", 1000, "btn_1000w", m)}
            ${this._renderWattBtn("2000W", "חימום בינוני", "🔥", 2000, "btn_2000w", m)}
            ${this._renderWattBtn("3000W", "חימום מלא",   "♨️", 3000, "btn_3000w", m)}
          </div>

          <!-- BOTTOM BUTTONS -->
          <div class="bottom-row">
            <button
              class="bottom-btn ${dark ? "bottom-night" : "bottom-day"}"
              @click=${() => this._pressButton(this.config.btn_timer)}
              title="טיימר"
            >⏱ טיימר</button>
            <button
              class="bottom-btn ${dark ? "bottom-night" : "bottom-day"}"
              @click=${() => this._pressButton(this.config.btn_sync)}
              title="סנכרן מצב"
            >↺ סנכרן</button>
          </div>
        </div>
      </div>
    `;
  }
}

// ─── EDITOR ───────────────────────────────────────────────────────────────────

class HeaterIrCardEditor extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  setConfig(config) {
    this.config = config;
  }

  _schema() {
    return [
      { name: "name", label: "שם הכרטיס", selector: { text: {} } },
      {
        name: "heater_switch",
        label: "מתג תנור (switch) — חובה",
        selector: { entity: { domain: "switch" } },
      },
      {
        name: "btn_1000w",
        label: "כפתור 1000W",
        selector: { entity: { domain: "button" } },
      },
      {
        name: "btn_2000w",
        label: "כפתור 2000W",
        selector: { entity: { domain: "button" } },
      },
      {
        name: "btn_3000w",
        label: "כפתור 3000W",
        selector: { entity: { domain: "button" } },
      },
      {
        name: "btn_timer",
        label: "כפתור טיימר",
        selector: { entity: { domain: "button" } },
      },
      {
        name: "btn_sync",
        label: "כפתור סנכרון מצב",
        selector: { entity: { domain: "button" } },
      },
    ];
  }

  _valueChanged(ev) {
    const newConfig = ev.detail.value;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: newConfig } })
    );
  }

  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${this._schema()}
        .computeLabel=${(s) => s.label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

// ─── REGISTRATION ─────────────────────────────────────────────────────────────

customElements.define("heater-ir-card", HeaterIrCard);
customElements.define("heater-ir-card-editor", HeaterIrCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "heater-ir-card",
  name: "תנור חימום IR",
  description: "כרטיס שליטה בתנור חימום דרך IR Blaster עם פסי LED ואנימציות",
  preview: true,
});
