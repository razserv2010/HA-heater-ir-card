# 🔥 Heater IR Card

כרטיס Home Assistant לשליטה בתנור חימום דרך IR Blaster (ESPHome).

## תכונות
- פס LED מסתובב בצבעי אש (יום) / סגול-כחול (לילה)
- מד עוצמת חימום ויזואלי
- 3 כפתורי עוצמה: 1000W / 2000W / 3000W
- מתג ON/OFF
- כפתורי טיימר וסנכרון מצב
- מצב יום/לילה אוטומטי לפי HA theme
- עורך קונפיגורציה נטיבי (ha-form)

## התקנה דרך HACS

1. ב-HACS → Frontend → תפריט שלוש נקודות → Custom repositories
2. הוסף: `https://github.com/YOUR_USERNAME/heater-ir-card`
3. קטגוריה: `Lovelace`
4. לחץ Add

## קונפיגורציה ידנית

```yaml
type: custom:heater-ir-card
name: תנור חימום
heater_switch: switch.ir_blaster_remote_תנור_חימום
btn_1000w: button.ir_blaster_remote_תנור_1000w
btn_2000w: button.ir_blaster_remote_תנור_2000w
btn_3000w: button.ir_blaster_remote_תנור_3000w
btn_timer: button.ir_blaster_remote_תנור_טיימר
btn_sync: button.ir_blaster_remote_תנור_סנכרון_מצב
```

## ESPHome

מתאים לקובץ `ir-blaster-remote.yaml` עם:
- `switch` → תנור חימום (NEC address: 0xFF00, command: 0xBA45)
- `button` → 1000W / 2000W / 3000W / טיימר / סנכרון
