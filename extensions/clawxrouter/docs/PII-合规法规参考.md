# PII 合规法规参考 — 各国/地区敏感信息定义

> **版本**: 2026.3.25
> **用途**: GuardClaw 假数据生成器（fake-data.ts）和 PII 检测系统的法规依据
> **覆盖法规**: GDPR (EU), CCPA/CPRA (US-CA), HIPAA (US), GLBA (US), COPPA (US), FERPA (US), PIPL (CN)

---

## 目录

1. [概述](#1-概述)
2. [欧盟 GDPR](#2-欧盟-gdpr)
3. [美国 CCPA/CPRA](#3-美国-ccpacpra)
4. [美国 HIPAA](#4-美国-hipaa)
5. [美国 GLBA](#5-美国-glba)
6. [美国 COPPA](#6-美国-coppa)
7. [美国 FERPA](#7-美国-ferpa)
8. [中国 PIPL](#8-中国-pipl)
9. [跨法规 PII 类型矩阵](#9-跨法规-pii-类型矩阵)
10. [GuardClaw 覆盖映射](#10-guardclaw-覆盖映射)

---

## 1. 概述

GuardClaw 的 PII 检测与假数据替换系统需要覆盖主要法域中定义的所有敏感数据类型。本文档梳理了各法规对"个人信息"和"敏感个人信息"的法律定义，作为 `fake-data.ts` 生成器类型设计的规范依据。

**核心设计原则**：取各法规定义的并集（union），确保在任一法域下都不会遗漏敏感数据类型。

---

## 2. 欧盟 GDPR

**法规全称**: General Data Protection Regulation (EU) 2016/679
**生效日期**: 2018-05-25
**适用范围**: 所有处理欧盟居民个人数据的组织（无论组织所在地）

### 2.1 个人数据定义（第 4 条）

> "personal data" means any information relating to an identified or identifiable natural person ('data subject')

可识别的自然人是指能够通过以下标识符**直接或间接**被识别的人：

| 标识类别      | 具体内容                                  |
| ------------- | ----------------------------------------- |
| 直接标识符    | 姓名                                      |
| 证件号码      | 身份证号、护照号                          |
| 定位数据      | 地理位置、GPS 坐标                        |
| 网络标识符    | IP 地址、Cookie ID、设备标识符、RFID 标签 |
| 身体特征      | 体貌特征                                  |
| 生理特征      | 生理因素                                  |
| 遗传特征      | 基因数据                                  |
| 心理特征      | 心理/精神因素                             |
| 经济身份      | 收入、财务状况                            |
| 文化/社会身份 | 文化或社会身份因素                        |

**关键特点**: GDPR 采用**开放式定义**——"与已识别或可识别自然人相关的任何信息"，不穷举具体类型，覆盖面最广。

### 2.2 特殊类别数据（第 9 条）

原则上**禁止处理**以下 9 类数据（除非满足第 9(2) 条例外条件）：

| #   | 特殊类别       | 说明                                | GuardClaw 类型       |
| --- | -------------- | ----------------------------------- | -------------------- |
| 1   | 种族或民族起源 | 揭示种族/民族血统的数据             | `ETHNICITY`          |
| 2   | 政治观点       | 政治立场、党派倾向                  | `POLITICAL_OPINION`  |
| 3   | 宗教或哲学信仰 | 宗教信仰、无神论、哲学信条          | `RELIGION`           |
| 4   | 工会成员身份   | 是否加入工会                        | `UNION_MEMBERSHIP`   |
| 5   | 基因数据       | 遗传特征相关数据（第 4(13) 条定义） | `GENETIC`            |
| 6   | 生物特征数据   | 用于唯一识别的生物识别数据          | `BIOMETRIC`          |
| 7   | 健康数据       | 身体或心理健康相关数据              | `HEALTH`             |
| 8   | 性生活数据     | 性生活相关信息                      | `SEXUAL_ORIENTATION` |
| 9   | 性取向数据     | 性取向信息                          | `SEXUAL_ORIENTATION` |

### 2.3 犯罪记录数据（第 10 条）

与**刑事定罪和犯罪记录**相关的个人数据受特殊保护，仅在官方授权下才可处理。

| GuardClaw 类型    | 覆盖范围                     |
| ----------------- | ---------------------------- |
| `CRIMINAL_RECORD` | 犯罪记录、定罪信息、违法记录 |

---

## 3. 美国 CCPA/CPRA

**法规全称**: California Consumer Privacy Act / California Privacy Rights Act
**法条**: Cal. Civ. Code §1798.100-199.100
**适用范围**: 年收入超 2500 万美元 / 处理 10 万+ 消费者数据 / 50%+ 收入来自出售个人信息的企业

### 3.1 个人信息（§1798.140(v)）— 12 大类

| 类别             | 具体信息类型                                                             | GuardClaw 类型                                                             |
| ---------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| (A) 标识符       | 真实姓名、别名、邮寄地址、IP 地址、电子邮件、账户名、SSN、驾照号、护照号 | `NAME` `ADDRESS` `IP` `EMAIL` `USERNAME` `SSN` `DRIVER_LICENSE` `PASSPORT` |
| (B) §1798.80(e)  | 签名、体貌描述、电话、银行账号、信用卡号、医疗信息、健康保险信息         | `SIGNATURE` `PHONE` `BANK_ACCOUNT` `CARD` `HEALTH` `INSURANCE_NUMBER`      |
| (C) 受保护分类   | 种族、性别、年龄、残疾、退伍军人身份                                     | `ETHNICITY` `GENDER` `AGE`                                                 |
| (D) 商业信息     | 购买记录、消费历史、个人财产记录                                         | `ORDER` `TRANSACTION`                                                      |
| (E) 生物特征     | 指纹、面部识别、虹膜、声纹、击键模式、步态                               | `BIOMETRIC`                                                                |
| (F) 网络活动     | 浏览历史、搜索历史、交互信息                                             | `COOKIE_ID`                                                                |
| (G) 地理位置     | 精确地理位置信息                                                         | `GEO_COORDINATES`                                                          |
| (H) 感官数据     | 音频、视觉、热力、嗅觉等                                                 | — (媒体文件级别)                                                           |
| (I) 就业信息     | 职业或就业相关信息                                                       | `JOB_TITLE` `DEPARTMENT` `EMPLOYEE_ID`                                     |
| (J) 教育信息     | 非公开的个人可识别教育信息                                               | `STUDENT_ID`                                                               |
| (K) 推断信息     | 消费者画像推断（偏好、特征、行为等）                                     | — (算法级别)                                                               |
| (L) 敏感个人信息 | 见下表                                                                   | —                                                                          |

### 3.2 敏感个人信息（§1798.140(ae)）

| #    | 类别          | 具体内容                                          | GuardClaw 类型                                          |
| ---- | ------------- | ------------------------------------------------- | ------------------------------------------------------- |
| 1(A) | 政府身份标识  | SSN、驾照号、护照号                               | `SSN` `DRIVER_LICENSE` `PASSPORT`                       |
| 1(B) | 金融账户      | 账户登录、金融账号、信用卡/借记卡号 + 安全码/密码 | `CARD` `BANK_ACCOUNT` `PASSWORD`                        |
| 1(C) | 精确地理位置  | 半径 564 米以内的位置数据                         | `GEO_COORDINATES`                                       |
| 1(D) | 人口特征      | 种族/民族、公民身份、宗教信仰、工会成员           | `ETHNICITY` `NATIONALITY` `RELIGION` `UNION_MEMBERSHIP` |
| 1(E) | 通信内容      | 邮件、电子邮件、短信内容                          | `NOTE`                                                  |
| 1(F) | 基因数据      | 遗传/基因数据                                     | `GENETIC`                                               |
| 1(G) | 神经数据      | 中枢/外周神经系统活动信息（2024 年新增）          | — (专用设备级别)                                        |
| 2(A) | 生物特征      | 已处理的生物识别信息                              | `BIOMETRIC`                                             |
| 2(B) | 健康信息      | 消费者健康信息                                    | `HEALTH` `MEDICATION`                                   |
| 2(C) | 性生活/性取向 | 性生活或性取向信息                                | `SEXUAL_ORIENTATION`                                    |

---

## 4. 美国 HIPAA

**法规全称**: Health Insurance Portability and Accountability Act
**适用范围**: 医疗保健提供者、健康计划、医疗信息交换所及其业务伙伴

### 4.1 受保护健康信息（PHI）— 18 项标识符

HIPAA Safe Harbor 去标识化方法要求移除的 18 项标识符：

| #   | 标识符         | 说明                                       | GuardClaw 类型                 |
| --- | -------------- | ------------------------------------------ | ------------------------------ |
| 1   | 姓名           | 全名                                       | `NAME`                         |
| 2   | 地理信息       | 小于州的地理细分（街道、城市、县、邮编）   | `ADDRESS`                      |
| 3   | 日期           | 与个人相关的日期（出生、入院、出院、死亡） | `BIRTHDAY` `DATE`              |
| 4   | 电话号码       | —                                          | `PHONE`                        |
| 5   | 传真号码       | —                                          | `FAX`                          |
| 6   | 电子邮件       | —                                          | `EMAIL`                        |
| 7   | 社会安全号码   | —                                          | `SSN`                          |
| 8   | 病历号         | 医疗记录号                                 | `MEDICAL_RECORD_NUMBER`        |
| 9   | 医保受益人号码 | 健康计划号                                 | `HEALTH_PLAN_ID`               |
| 10  | 账户号码       | —                                          | `BANK_ACCOUNT`                 |
| 11  | 证书/执照号码  | —                                          | `DRIVER_LICENSE` `BIZ_LICENSE` |
| 12  | 车辆标识符     | 含车牌号                                   | `LICENSE_PLATE`                |
| 13  | 设备标识符     | 含序列号                                   | `DEVICE_ID`                    |
| 14  | URL            | —                                          | `URL`                          |
| 15  | IP 地址        | —                                          | `IP`                           |
| 16  | 生物特征标识符 | 指纹、声纹                                 | `BIOMETRIC`                    |
| 17  | 全脸照片       | 可识别的面部图像                           | — (媒体文件级别)               |
| 18  | 其他唯一识别号 | 任何可唯一识别个人的编号/特征/代码         | 兜底: `default` case           |

**关键特点**: PHI = 健康信息 + 上述任一标识符。HIPAA 以排除法定义——移除全部 18 项即视为去标识化。

---

## 5. 美国 GLBA

**法规全称**: Gramm-Leach-Bliley Act (15 U.S.C. §6801-6809)
**适用范围**: 金融机构（银行、证券、保险、贷款等）

### 5.1 非公开个人信息（NPI）

| 类别     | 具体信息类型                     | GuardClaw 类型                |
| -------- | -------------------------------- | ----------------------------- |
| 账户信息 | 银行账号、信用卡号、借记卡号     | `BANK_ACCOUNT` `CARD`         |
| 交易信息 | 账户余额、交易历史、支付记录     | `TRANSACTION` `AMOUNT`        |
| 贷款信息 | 贷款金额、还款记录、信用额度     | `LOAN_NUMBER`                 |
| 保险信息 | 保单号、保费金额、理赔记录       | `INSURANCE_NUMBER`            |
| 投资信息 | 投资组合、证券持仓、收益记录     | `AMOUNT`                      |
| 个人标识 | SSN、收入信息、信用评分/信用报告 | `SSN` `SALARY` `CREDIT_SCORE` |
| 申请信息 | 金融产品/服务申请中的个人信息    | 综合覆盖                      |
| 派生列表 | 使用 NPI 派生的消费者列表/分组   | — (算法级别)                  |

---

## 6. 美国 COPPA

**法规全称**: Children's Online Privacy Protection Act (15 U.S.C. §6501-6506)
**适用范围**: 面向 13 岁以下儿童的在线服务运营商

### 6.1 个人信息

| #    | 类别                              | GuardClaw 类型               |
| ---- | --------------------------------- | ---------------------------- |
| 1    | 名和姓                            | `NAME`                       |
| 2    | 住家或实际地址                    | `ADDRESS`                    |
| 3    | 电子邮件地址                      | `EMAIL`                      |
| 4    | 电话号码                          | `PHONE`                      |
| 5    | 社会安全号码                      | `SSN`                        |
| 6    | 可联系个人的其他标识符            | 综合覆盖                     |
| 7    | 组合信息                          | 综合覆盖                     |
| 8\*  | 照片、视频、音频文件              | — (媒体文件级别)             |
| 9\*  | 精确地理位置                      | `GEO_COORDINATES`            |
| 10\* | 持久标识符 (Cookie/IP/设备序列号) | `COOKIE_ID` `IP` `DEVICE_ID` |

> `*` 为 FTC 规则 16 CFR 312.2 扩展定义

---

## 7. 美国 FERPA

**法规全称**: Family Educational Rights and Privacy Act (20 U.S.C. §1232g)
**适用范围**: 接受联邦教育资金的教育机构

### 7.1 个人可识别信息 (34 CFR §99.3)

| #   | 类别           | 说明                         | GuardClaw 类型                  |
| --- | -------------- | ---------------------------- | ------------------------------- |
| 1   | 学生姓名       | —                            | `NAME`                          |
| 2   | 家庭成员姓名   | 父母/其他家庭成员            | `NAME`                          |
| 3   | 地址           | 学生或家庭住址               | `ADDRESS`                       |
| 4   | 个人标识符     | SSN、学生证号码              | `SSN` `STUDENT_ID`              |
| 5   | 间接标识符     | 出生日期、出生地、母亲婚前姓 | `BIRTHDAY` `BIRTH_PLACE` `NAME` |
| 6   | 其他可识别信息 | 合理确信可识别学生的信息     | 综合覆盖                        |

**受保护的教育记录**: 成绩单、课程表、纪律记录、考勤记录、特殊教育记录、经济援助记录。

---

## 8. 中国 PIPL

**法规全称**: 个人信息保护法（2021 年 11 月 1 日施行）
**适用范围**: 在中国境内处理自然人个人信息的活动

### 8.1 个人信息定义（第 4 条）

> 个人信息是以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。

### 8.2 敏感个人信息（第 28 条）

> 敏感个人信息是一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息。

| #   | 敏感类别                 | 说明                             | GuardClaw 类型                                     |
| --- | ------------------------ | -------------------------------- | -------------------------------------------------- |
| 1   | 生物识别信息             | 指纹、虹膜、人脸识别、声纹、步态 | `BIOMETRIC`                                        |
| 2   | 宗教信仰                 | —                                | `RELIGION`                                         |
| 3   | 特定身份                 | 民族/种族                        | `ETHNICITY`                                        |
| 4   | 医疗健康                 | 疾病诊断、治疗记录、体检报告     | `HEALTH` `MEDICATION` `MEDICAL_RECORD_NUMBER`      |
| 5   | 金融账户                 | 银行账号、交易记录、征信信息     | `BANK_ACCOUNT` `CARD` `CREDIT_SCORE` `TRANSACTION` |
| 6   | 行踪轨迹                 | GPS 定位、出行记录               | `GEO_COORDINATES` `ADDRESS`                        |
| 7   | 不满 14 周岁未成年人信息 | 所有个人信息均视为敏感信息       | 全部类型                                           |

### 8.3 PIPL vs GDPR 关键差异

| 维度         | GDPR                        | PIPL             |
| ------------ | --------------------------- | ---------------- |
| 特殊类别列举 | 9 类（Art.9）               | 7 类（第 28 条） |
| 政治观点     | 明确列为特殊类别            | 未单独列举       |
| 工会成员     | 明确列为特殊类别            | 未单独列举       |
| 性取向       | 明确列为特殊类别            | 未单独列举       |
| 基因数据     | 明确列为特殊类别            | 归入"生物识别"   |
| 犯罪记录     | Art.10 特殊保护             | 未单独列举       |
| 行踪轨迹     | 归入"定位数据"              | 明确列为敏感类别 |
| 金融信息     | 未列为特殊类别              | 明确列为敏感类别 |
| 儿童年龄门槛 | 16 岁（成员国可降至 13 岁） | 14 岁            |

---

## 9. 跨法规 PII 类型矩阵

| PII 类型        | GDPR Art.4 | GDPR Art.9 | CCPA | HIPAA | GLBA | COPPA | FERPA | PIPL |
| --------------- | :--------: | :--------: | :--: | :---: | :--: | :---: | :---: | :--: |
| 姓名            |     ●      |            |  ●   |   ●   |      |   ●   |   ●   |  ●   |
| 地址/地理信息   |     ●      |            |  ●   |   ●   |      |   ●   |   ●   |  ●   |
| 出生日期/年龄   |     ●      |            |  ●   |   ●   |      |       |   ●   |  ●   |
| 出生地          |            |            |  ●   |       |      |       |   ●   |      |
| 性别            |            |            |  ●   |       |      |       |       |      |
| 电话号码        |            |            |  ●   |   ●   |      |   ●   |       |  ●   |
| 传真号码        |            |            |      |   ●   |      |       |       |      |
| 电子邮件        |     ●      |            |  ●   |   ●   |      |   ●   |       |  ●   |
| SSN/身份证号    |     ●      |            |  ●   |   ●   |  ●   |   ●   |   ●   |  ●   |
| 驾照号          |            |            |  ●   |   ●   |      |       |       |      |
| 护照号          |            |            |  ●   |       |      |       |       |  ●   |
| IP 地址         |     ●      |            |  ●   |   ●   |      |   ●   |       |  ●   |
| 种族/民族       |            |     ●      |  ●   |       |      |       |       |  ●   |
| 政治观点        |            |     ●      |      |       |      |       |       |      |
| 宗教/哲学信仰   |            |     ●      |  ●   |       |      |       |       |  ●   |
| 工会成员        |            |     ●      |  ●   |       |      |       |       |      |
| 基因数据        |            |     ●      |  ●   |       |      |       |       |  ●   |
| 生物特征        |            |     ●      |  ●   |   ●   |      |       |       |  ●   |
| 健康信息        |            |     ●      |  ●   |   ●   |      |       |       |  ●   |
| 性生活/性取向   |            |     ●      |  ●   |       |      |       |       |      |
| 犯罪记录        |   Art.10   |            |      |       |      |       |       |      |
| 金融账户/信用卡 |            |            |  ●   |   ●   |  ●   |       |       |  ●   |
| 信用评分        |            |            |      |       |  ●   |       |       |  ●   |
| 保险信息        |            |            |  ●   |   ●   |  ●   |       |       |      |
| 贷款信息        |            |            |      |       |  ●   |       |       |      |
| 交易/消费记录   |            |            |  ●   |       |  ●   |       |       |  ●   |
| 精确地理坐标    |     ●      |            |  ●   |       |      |   ●   |       |  ●   |
| 浏览/搜索历史   |            |            |  ●   |       |      |       |       |      |
| 设备标识符      |     ●      |            |  ●   |   ●   |      |   ●   |       |  ●   |
| Cookie/追踪ID   |     ●      |            |  ●   |       |      |   ●   |       |      |
| 教育信息        |            |            |  ●   |       |      |       |   ●   |      |
| 就业信息        |            |            |  ●   |       |      |       |       |      |
| 医疗记录号      |            |            |      |   ●   |      |       |       |  ●   |
| 医保计划号      |            |            |      |   ●   |      |       |       |      |
| 车辆标识符      |            |            |      |   ●   |      |       |       |      |
| URL             |            |            |      |   ●   |      |       |       |      |
| 签名            |            |            |  ●   |       |      |       |       |      |
| 通信内容        |            |            |  ●   |       |      |       |       |      |
| 国籍/移民身份   |            |            |  ●   |       |      |       |       |  ●   |
| 用户名/账户名   |     ●      |            |  ●   |       |      |       |       |  ●   |

> ● = 该法规明确将此类型定义为个人信息/敏感信息

---

## 10. GuardClaw 覆盖映射

以下为 `fake-data.ts` 中 `generateFakeValue()` 支持的全部 PII 类型及其法规来源：

### 10.1 个人基础信息

| 生成器类型       | switch case 别名                         | 法规来源                         |
| ---------------- | ---------------------------------------- | -------------------------------- |
| `NAME`           | `SENDER_NAME` `RECIPIENT_NAME`           | GDPR/CCPA/HIPAA/COPPA/FERPA/PIPL |
| `PHONE`          | `SENDER_PHONE` `FACILITY_PHONE` `MOBILE` | CCPA/HIPAA/COPPA/PIPL            |
| `LANDLINE`       | —                                        | HIPAA                            |
| `FAX`            | `FAX_NUMBER`                             | HIPAA                            |
| `ADDRESS`        | —                                        | GDPR/CCPA/HIPAA/COPPA/FERPA/PIPL |
| `EMAIL`          | —                                        | GDPR/CCPA/HIPAA/COPPA/PIPL       |
| `ID`             | `ID_CARD` `ID_NUMBER`                    | GDPR/CCPA/HIPAA/PIPL             |
| `PASSPORT`       | `PASSPORT_NUMBER`                        | CCPA                             |
| `DRIVER_LICENSE` | `DRIVERS_LICENSE` `DL`                   | CCPA/HIPAA                       |
| `SSN`            | —                                        | CCPA/HIPAA/GLBA/COPPA/FERPA      |
| `BIRTHDAY`       | `DOB` `DATE_OF_BIRTH`                    | GDPR/CCPA/HIPAA/FERPA            |
| `AGE`            | —                                        | CCPA                             |
| `GENDER`         | `SEX`                                    | CCPA                             |
| `BIRTH_PLACE`    | `PLACE_OF_BIRTH` `BIRTHPLACE`            | CCPA/FERPA                       |
| `NATIONALITY`    | `CITIZENSHIP` `IMMIGRATION_STATUS`       | CCPA/PIPL                        |
| `USERNAME`       | `ACCOUNT_NAME` `SCREEN_NAME` `HANDLE`    | CCPA                             |
| `SIGNATURE`      | `DIGITAL_SIGNATURE`                      | CCPA                             |
| `IP`             | —                                        | GDPR/HIPAA/COPPA                 |

### 10.2 GDPR Art.9 特殊类别

| 生成器类型           | switch case 别名                                    | GDPR 条款     |
| -------------------- | --------------------------------------------------- | ------------- |
| `ETHNICITY`          | `RACE` `ETHNIC_ORIGIN`                              | Art.9(1)      |
| `RELIGION`           | `RELIGIOUS_BELIEF` `PHILOSOPHICAL_BELIEF`           | Art.9(1)      |
| `POLITICAL_OPINION`  | `POLITICAL_AFFILIATION` `POLITICAL_PARTY`           | Art.9(1)      |
| `UNION_MEMBERSHIP`   | `TRADE_UNION`                                       | Art.9(1)      |
| `GENETIC`            | `GENETIC_DATA` `GENETIC_MARKER` `DNA`               | Art.9(1)      |
| `BIOMETRIC`          | `BIOMETRIC_ID` `FINGERPRINT` `FACE_ID` `VOICEPRINT` | Art.9(1)      |
| `HEALTH`             | `HEALTH_CONDITION` `MEDICAL_CONDITION` `DIAGNOSIS`  | Art.9(1)      |
| `MEDICATION`         | `PRESCRIPTION` `DRUG`                               | Art.9(1) 衍生 |
| `SEXUAL_ORIENTATION` | `SEXUALITY`                                         | Art.9(1)      |
| `CRIMINAL_RECORD`    | `CONVICTION` `OFFENSE`                              | Art.10        |

### 10.3 医疗/保险/金融

| 生成器类型              | switch case 别名                                 | 法规来源             |
| ----------------------- | ------------------------------------------------ | -------------------- |
| `CARD`                  | `BANK_CARD` `CARD_NUMBER`                        | CCPA/GLBA/PIPL       |
| `BANK_ACCOUNT`          | `ACCOUNT_NUMBER`                                 | CCPA/HIPAA/GLBA/PIPL |
| `MEDICAL_RECORD_NUMBER` | `MRN` `PATIENT_ID`                               | HIPAA/PIPL           |
| `HEALTH_PLAN_ID`        | `HEALTH_PLAN_NUMBER` `MEDICARE_ID` `MEDICAID_ID` | HIPAA                |
| `INSURANCE_NUMBER`      | `INSURANCE_ID` `POLICY_NUMBER`                   | CCPA/GLBA            |
| `CREDIT_SCORE`          | `CREDIT_RATING` `FICO_SCORE`                     | GLBA/PIPL            |
| `LOAN_NUMBER`           | `LOAN_ID` `MORTGAGE_NUMBER`                      | GLBA                 |
| `SALARY`                | `INCOME` `WAGE`                                  | GLBA                 |
| `AMOUNT`                | `PRICE` `COST`                                   | GLBA                 |
| `PAYMENT`               | `PAYMENT_ACCOUNT`                                | CCPA/PIPL            |

### 10.4 技术标识符

| 生成器类型        | switch case 别名                                         | 法规来源              |
| ----------------- | -------------------------------------------------------- | --------------------- |
| `DEVICE_ID`       | `DEVICE_IDENTIFIER` `SERIAL_NUMBER` `IMEI` `MAC_ADDRESS` | HIPAA/CCPA/COPPA/PIPL |
| `GEO_COORDINATES` | `GPS` `LATITUDE_LONGITUDE` `LOCATION` `GEOLOCATION`      | CCPA/COPPA/PIPL       |
| `COOKIE_ID`       | `TRACKING_ID` `ADVERTISING_ID` `DEVICE_FINGERPRINT`      | GDPR/CCPA/COPPA       |
| `LICENSE_PLATE`   | `PLATE`                                                  | HIPAA                 |
| `URL`             | —                                                        | HIPAA                 |
| `DOMAIN`          | `WEBSITE`                                                | 通用                  |

### 10.5 密钥/凭据

| 生成器类型      | switch case 别名                                             | 保护依据                 |
| --------------- | ------------------------------------------------------------ | ------------------------ |
| `API_KEY`       | —                                                            | 通用安全最佳实践         |
| `ACCESS_KEY`    | `AK` `AWS_KEY` `AWS_ACCESS_KEY`                              | 通用安全最佳实践         |
| `SECRET_KEY`    | `SK` `AWS_SECRET` `AWS_SECRET_KEY`                           | 通用安全最佳实践         |
| `JWT`           | `JWT_TOKEN` `BEARER_TOKEN`                                   | 通用安全最佳实践         |
| `PRIVATE_KEY`   | `RSA_PRIVATE_KEY` `RSA_KEY`                                  | 通用安全最佳实践         |
| `PUBLIC_KEY`    | `RSA_PUBLIC_KEY`                                             | 通用安全最佳实践         |
| `CERTIFICATE`   | `CERT` `X509` `HTTPS_CERT` `SSL_CERT` `TLS_CERT` `X509_CERT` | 通用安全最佳实践         |
| `SSH_KEY`       | `SSH_PUBLIC_KEY`                                             | 通用安全最佳实践         |
| `DB_CONNECTION` | `CONNECTION_STRING` `DATABASE_URL`                           | 通用安全最佳实践         |
| `ENV_VAR`       | `ENV_VARIABLE`                                               | 通用安全最佳实践         |
| `SECRET`        | `PASSWORD` `TOKEN` `CREDENTIAL`                              | CCPA §1798.140(ae)(1)(B) |

### 10.6 企业信息

| 生成器类型    | switch case 别名                    | 保护依据          |
| ------------- | ----------------------------------- | ----------------- |
| `COMPANY`     | `COMPANY_NAME` `ORGANIZATION` `ORG` | 商业秘密/竞争情报 |
| `USCC`        | `UNIFIED_SOCIAL_CREDIT_CODE`        | 中国企业标识      |
| `TAX_ID`      | `TAX_NUMBER`                        | 企业财务信息      |
| `BIZ_LICENSE` | `BUSINESS_LICENSE`                  | 企业注册信息      |
| `ORG_CODE`    | `ORGANIZATION_CODE`                 | 企业注册信息      |
| `JOB_TITLE`   | `POSITION` `TITLE`                  | CCPA (I)          |
| `DEPARTMENT`  | `DEPT`                              | CCPA (I)          |
| `EMPLOYEE_ID` | `STAFF_ID` `WORKER_ID`              | 内部标识          |

### 10.7 业务经营数据

| 生成器类型    | switch case 别名                | 保护依据            |
| ------------- | ------------------------------- | ------------------- |
| `ORDER`       | `ORDER_NUMBER` `ORDER_ID`       | 商业秘密 / CCPA (D) |
| `CONTRACT`    | `CONTRACT_NUMBER` `CONTRACT_ID` | 商业秘密            |
| `INVOICE`     | `INVOICE_NUMBER` `INVOICE_ID`   | 财务信息            |
| `CUSTOMER_ID` | `CUSTOMER_NUMBER` `CLIENT_ID`   | 客户隐私            |
| `TRANSACTION` | `TRANSACTION_ID` `TXN_ID`       | GLBA / PIPL         |
| `RECEIPT`     | `RECEIPT_NUMBER` `RECEIPT_ID`   | 财务信息            |
| `SKU`         | `ITEM_CODE` `PRODUCT_CODE`      | 商业秘密            |
| `PRODUCT`     | `PRODUCT_NAME` `ITEM_NAME`      | 商业秘密            |
| `PROJECT`     | `PROJECT_CODE` `PROJECT_ID`     | 内部标识            |
| `STUDENT_ID`  | `STUDENT_NUMBER`                | FERPA               |

### 10.8 行为/通信数据

| 生成器类型         | switch case 别名                                                         | 法规来源                 |
| ------------------ | ------------------------------------------------------------------------ | ------------------------ |
| `BROWSING_HISTORY` | `SEARCH_HISTORY` `SEARCH_QUERY` `BROWSING_DATA` `WEB_HISTORY`            | CCPA (F)                 |
| `MESSAGE_CONTENT`  | `COMMUNICATION` `SMS_CONTENT` `EMAIL_CONTENT` `CHAT_MESSAGE` `MAIL_BODY` | CCPA §1798.140(ae)(1)(E) |

---

## 附录 A: 法规原文链接

| 法规      | 原文链接                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| GDPR      | https://eur-lex.europa.eu/eli/reg/2016/679/oj                                                                 |
| CCPA/CPRA | https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&part=4.&lawCode=CIV&title=1.81.5 |
| HIPAA     | https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html                               |
| GLBA      | https://www.ftc.gov/legal-library/browse/statutes/gramm-leach-bliley-act                                      |
| COPPA     | https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa                 |
| FERPA     | https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html                                                     |
| PIPL      | https://www.gov.cn/xinwen/2021-08/20/content_5632486.htm                                                      |
