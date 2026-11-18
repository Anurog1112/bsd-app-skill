# BSD App Skill 1.1

ชุดคำแนะนำ (Markdown) ให้ AI ของ BSD Online สร้างแอป HTML/CSS/JS ที่ทำงานได้จริงตาม "เกณฑ์ผ่าน" ทุกเกณฑ์กลายเป็นการทดสอบอัตโนมัติที่ผู้เรียนกดดูผลเองได้ และแอปมีตัวจับ error ที่ทำรายงานบั๊กให้

## เริ่มใช้ (ผู้เรียน)

วางข้อความนี้ในแชท AI ของ BSD:

```text
งาน: สร้างไฟล์ SKILL.md ที่ root ของโปรเจกต์นี้
เนื้อหาไฟล์ = ข้อความ Markdown ทั้งหมดจาก
https://raw.githubusercontent.com/Anurog1112/bsd-app-skill/v1.1.0/SKILL.md
ใส่ทุกบรรทัดตามต้นฉบับ ไม่สรุป ไม่แปล ไม่ตัด บรรทัดสุดท้ายของไฟล์คือ "— จบ SKILL.md v1.1.0 —"
รอบนี้ยังไม่เขียนแอป เมื่อสร้างไฟล์แล้ว ตอบเฉพาะ: ตารางคำสั่ง /skill จากไฟล์ และบรรทัดสุดท้ายของไฟล์
```

จากนั้นใช้ prompt ใน [PROMPTS.md](PROMPTS.md)

## ไฟล์

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| [SKILL.md](SKILL.md) | คู่มือหลัก: คำสั่ง `/skill app·add·fix·test·check` |
| [PROMPTS.md](PROMPTS.md) | prompt สำเร็จรูป + ตัวอย่างเกณฑ์ผ่าน |
| [README-ครู.md](README-ครู.md) | คู่มือครู แผน workshop 90 นาที |
| [references/](references) | รายละเอียดเพิ่ม: ข้อมูล/API, หน้าจอ, การทดสอบ, การแก้บั๊ก |
| [example/](example) | แอปตัวอย่าง "คิวดี" ([เปิดออนไลน์](https://anurog1112.github.io/bsd-app-skill/example/)) |
| [NOTICE.md](NOTICE.md) | ที่มาของเนื้อหา |
