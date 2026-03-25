import { describe, it, expect } from "vitest";
import { generateFakeValue, generateFakeEmail, generateFakePhone } from "./fake-data.js";

describe("generateFakeValue", () => {
  it("NAME zh-CN returns Chinese name different from original", () => {
    const result = generateFakeValue("NAME", "张伟", "zh-CN");
    expect(result).not.toBe("张伟");
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(/^[\u4e00-\u9fa5]+$/.test(result)).toBe(true);
  });

  it("NAME en returns English name", () => {
    const result = generateFakeValue("NAME", "John Smith", "en");
    expect(result).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
  });

  it("SENDER_NAME maps to name generator", () => {
    const result = generateFakeValue("SENDER_NAME", "李娜", "zh-CN");
    expect(/^[\u4e00-\u9fa5]+$/.test(result)).toBe(true);
  });

  it("PHONE zh-CN returns 11-digit number starting with 1", () => {
    const result = generateFakeValue("PHONE", "13800138000", "zh-CN");
    expect(result).toMatch(/^1[3-9]\d{9}$/);
    expect(result).not.toBe("13800138000");
  });

  it("PHONE en returns +1-xxx-xxx-xxxx format", () => {
    const result = generateFakeValue("PHONE", "+1-555-123-4567", "en");
    expect(result).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/);
  });

  it("LANDLINE zh-CN returns area code + 8 digits", () => {
    const result = generateFakeValue("LANDLINE", "010-12345678", "zh-CN");
    expect(result).toMatch(/^0\d{2,3}-\d{8}$/);
  });

  it("LANDLINE en returns (xxx) xxx-xxxx format", () => {
    const result = generateFakeValue("LANDLINE", "(555) 123-4567", "en");
    expect(result).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/);
  });

  it("EMAIL returns @example.com address", () => {
    const result = generateFakeValue("EMAIL", "test@real.com", "en");
    expect(result).toMatch(/^fakeuser\d+@example\.com$/);
  });

  it("ID zh-CN returns 18-character string", () => {
    const result = generateFakeValue("ID", "110101199001011234", "zh-CN");
    expect(result).toHaveLength(18);
    expect(result).toMatch(/^\d{17}[\dX]$/);
  });

  it("CARD returns 16-digit string with bank prefix", () => {
    const result = generateFakeValue("CARD", "6222021234567890", "zh-CN");
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^\d{16}$/);
  });

  it("SECRET returns string with same length as original", () => {
    const original = "sk-abc123def456ghi";
    const result = generateFakeValue("SECRET", original, "en");
    expect(result).toHaveLength(original.length);
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("CREDENTIAL maps to secret generator", () => {
    const original = "myCredential123";
    const result = generateFakeValue("CREDENTIAL", original, "en");
    expect(result).toHaveLength(original.length);
  });

  it("API_KEY preserves sk- prefix", () => {
    const result = generateFakeValue("API_KEY", "sk-proj-abc123def456ghi789", "en");
    expect(result).toMatch(/^sk-/);
    expect(result).toHaveLength("sk-proj-abc123def456ghi789".length);
  });

  it("API_KEY with unknown prefix returns sk-fake-xxx", () => {
    const result = generateFakeValue("API_KEY", "some-random-key", "en");
    expect(result).toMatch(/^sk-fake-/);
  });

  it("ACCESS_KEY returns AKIA-prefixed 20-char string", () => {
    const result = generateFakeValue("ACCESS_KEY", "", "en");
    expect(result).toMatch(/^AKIA[A-Z0-9]{16}$/);
    expect(result).toHaveLength(20);
  });

  it("AK maps to access key generator", () => {
    const result = generateFakeValue("AK", "", "en");
    expect(result).toMatch(/^AKIA/);
  });

  it("SECRET_KEY returns 40-char base62 string", () => {
    const result = generateFakeValue("SECRET_KEY", "", "en");
    expect(result).toHaveLength(40);
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("SK maps to secret key generator", () => {
    const result = generateFakeValue("SK", "", "en");
    expect(result).toHaveLength(40);
  });

  it("JWT returns valid JWT structure with 3 dot-separated parts", () => {
    const result = generateFakeValue("JWT", "", "en");
    const parts = result.split(".");
    expect(parts).toHaveLength(3);
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    expect(header).toEqual({ alg: "HS256", typ: "JWT" });
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    expect(payload.sub).toMatch(/^user_\d{6}$/);
    expect(payload.iat).toBeTypeOf("number");
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it("JWT_TOKEN and BEARER_TOKEN map to JWT generator", () => {
    const r1 = generateFakeValue("JWT_TOKEN", "", "en");
    const r2 = generateFakeValue("BEARER_TOKEN", "", "en");
    expect(r1.split(".")).toHaveLength(3);
    expect(r2.split(".")).toHaveLength(3);
  });

  it("PRIVATE_KEY returns PEM-formatted RSA private key", () => {
    const result = generateFakeValue("PRIVATE_KEY", "", "en");
    expect(result).toContain("-----BEGIN RSA PRIVATE KEY-----");
    expect(result).toContain("-----END RSA PRIVATE KEY-----");
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(8);
  });

  it("RSA_KEY maps to private key generator", () => {
    const result = generateFakeValue("RSA_KEY", "", "en");
    expect(result).toContain("-----BEGIN RSA PRIVATE KEY-----");
  });

  it("PUBLIC_KEY returns PEM-formatted public key", () => {
    const result = generateFakeValue("PUBLIC_KEY", "", "en");
    expect(result).toContain("-----BEGIN PUBLIC KEY-----");
    expect(result).toContain("-----END PUBLIC KEY-----");
  });

  it("CERTIFICATE returns PEM-formatted certificate", () => {
    const result = generateFakeValue("CERTIFICATE", "", "en");
    expect(result).toContain("-----BEGIN CERTIFICATE-----");
    expect(result).toContain("-----END CERTIFICATE-----");
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(10);
  });

  it("CERT, X509, HTTPS_CERT, SSL_CERT, TLS_CERT map to certificate generator", () => {
    for (const t of ["CERT", "X509", "X509_CERT", "HTTPS_CERT", "SSL_CERT", "TLS_CERT"]) {
      const result = generateFakeValue(t, "", "en");
      expect(result).toContain("-----BEGIN CERTIFICATE-----");
    }
  });

  it("SSH_KEY returns ssh-rsa format", () => {
    const result = generateFakeValue("SSH_KEY", "", "en");
    expect(result).toMatch(/^ssh-rsa [A-Za-z0-9]+ fakeuser@example\.com$/);
  });

  it("DB_CONNECTION returns valid connection string format", () => {
    const result = generateFakeValue("DB_CONNECTION", "", "en");
    expect(result).toMatch(/^(mysql|postgresql|mongodb|redis):\/\//);
  });

  it("CONNECTION_STRING and DATABASE_URL map to DB connection", () => {
    const r1 = generateFakeValue("CONNECTION_STRING", "", "en");
    const r2 = generateFakeValue("DATABASE_URL", "", "en");
    expect(r1).toMatch(/:\/\//);
    expect(r2).toMatch(/:\/\//);
  });

  it("ENV_VAR preserves key name from original", () => {
    const result = generateFakeValue("ENV_VAR", "OPENAI_API_KEY=sk-real-key-here", "en");
    expect(result).toMatch(/^OPENAI_API_KEY=[A-Za-z0-9]+$/);
  });

  it("ENV_VAR without = returns FAKE_VAR=xxx", () => {
    const result = generateFakeValue("ENV_VAR", "no-equals-sign", "en");
    expect(result).toMatch(/^FAKE_VAR=[A-Za-z0-9]+$/);
  });

  it("IP returns 10.x.x.x format", () => {
    const result = generateFakeValue("IP", "192.168.1.1", "en");
    expect(result).toMatch(/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });

  it("unknown type returns [FAKE:TYPE:xxxx] format", () => {
    const result = generateFakeValue("UNKNOWN_THING", "whatever", "en");
    expect(result).toMatch(/^\[FAKE:UNKNOWN_THING:[0-9a-f]{4}\]$/);
  });

  it("multiple calls produce varied results (randomness)", () => {
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      results.add(generateFakeValue("NAME", "张伟", "zh-CN"));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it("ID_CARD and ID_NUMBER map to same generator", () => {
    const r1 = generateFakeValue("ID_CARD", "", "zh-CN");
    const r2 = generateFakeValue("ID_NUMBER", "", "zh-CN");
    expect(r1).toHaveLength(18);
    expect(r2).toHaveLength(18);
  });

  it("BANK_CARD and CARD_NUMBER map to card generator", () => {
    const r1 = generateFakeValue("BANK_CARD", "", "en");
    const r2 = generateFakeValue("CARD_NUMBER", "", "en");
    expect(r1).toMatch(/^\d{16}$/);
    expect(r2).toMatch(/^\d{16}$/);
  });

  it("PASSWORD and TOKEN map to secret generator", () => {
    const original = "mypassword123";
    const r1 = generateFakeValue("PASSWORD", original, "en");
    const r2 = generateFakeValue("TOKEN", original, "en");
    expect(r1).toHaveLength(original.length);
    expect(r2).toHaveLength(original.length);
  });

  it("LICENSE_PLATE zh-CN returns Chinese plate format", () => {
    const result = generateFakeValue("LICENSE_PLATE", "京A12345", "zh-CN");
    expect(result).toMatch(/^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}$/);
  });

  it("PLATE en returns ABC-1234 format", () => {
    const result = generateFakeValue("PLATE", "XYZ-9999", "en");
    expect(result).toMatch(/^[A-Z0-9]{3}-\d{4}$/);
  });

  it("ADDRESS zh-CN returns Chinese address", () => {
    const result = generateFakeValue("ADDRESS", "", "zh-CN");
    expect(result).toMatch(/[\u4e00-\u9fa5]/);
  });

  it("ADDRESS en returns English address", () => {
    const result = generateFakeValue("ADDRESS", "", "en");
    expect(result).toMatch(/^\d+ \w+ Street, \w+/);
  });

  it("ID en returns SSN format xxx-xx-xxxx", () => {
    const result = generateFakeValue("ID", "", "en");
    expect(result).toMatch(/^\d{3}-\d{2}-\d{4}$/);
  });

  it("COMPANY zh-CN returns city + company name", () => {
    const result = generateFakeValue("COMPANY", "", "zh-CN");
    expect(result).toMatch(/[\u4e00-\u9fa5]/);
    expect(result.length).toBeGreaterThan(4);
  });

  it("COMPANY en returns English company name", () => {
    const result = generateFakeValue("COMPANY", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("COMPANY_NAME and ORGANIZATION map to company generator", () => {
    const r1 = generateFakeValue("COMPANY_NAME", "", "zh-CN");
    const r2 = generateFakeValue("ORGANIZATION", "", "zh-CN");
    expect(r1).toMatch(/[\u4e00-\u9fa5]/);
    expect(r2).toMatch(/[\u4e00-\u9fa5]/);
  });

  it("USCC returns 18-char alphanumeric string starting with 9x", () => {
    const result = generateFakeValue("USCC", "", "zh-CN");
    expect(result).toMatch(/^9[1-3]\d{6}[A-Z0-9]{10}$/);
    expect(result).toHaveLength(18);
  });

  it("UNIFIED_SOCIAL_CREDIT_CODE maps to USCC", () => {
    const result = generateFakeValue("UNIFIED_SOCIAL_CREDIT_CODE", "", "zh-CN");
    expect(result).toHaveLength(18);
  });

  it("TAX_ID zh-CN returns USCC format", () => {
    const result = generateFakeValue("TAX_ID", "", "zh-CN");
    expect(result).toHaveLength(18);
  });

  it("TAX_ID en returns xx-xxxxxxx format", () => {
    const result = generateFakeValue("TAX_ID", "", "en");
    expect(result).toMatch(/^\d{2}-\d{7}$/);
  });

  it("BANK_ACCOUNT zh-CN returns 15-digit account", () => {
    const result = generateFakeValue("BANK_ACCOUNT", "", "zh-CN");
    expect(result).toMatch(/^\d{15}$/);
  });

  it("BANK_ACCOUNT en returns routing / account format", () => {
    const result = generateFakeValue("BANK_ACCOUNT", "", "en");
    expect(result).toMatch(/^\d{9} \/ \d{8,12}$/);
  });

  it("DOMAIN returns fake domain", () => {
    const result = generateFakeValue("DOMAIN", "", "en");
    expect(result).toMatch(/^[a-z]+\d+\.(com|net|io|co|org)$/);
  });

  it("URL returns https URL", () => {
    const result = generateFakeValue("URL", "", "en");
    expect(result).toMatch(/^https:\/\/[a-z]+\d+\.(com|net|io|co|org)\/path\/[0-9a-f]{6}$/);
  });

  it("JOB_TITLE zh-CN returns Chinese job title", () => {
    const result = generateFakeValue("JOB_TITLE", "", "zh-CN");
    expect(result).toMatch(/[\u4e00-\u9fa5]/);
  });

  it("JOB_TITLE en returns English job title", () => {
    const result = generateFakeValue("JOB_TITLE", "", "en");
    expect(result.length).toBeGreaterThan(2);
  });

  it("DEPARTMENT zh-CN returns Chinese department", () => {
    const result = generateFakeValue("DEPARTMENT", "", "zh-CN");
    expect(result).toMatch(/[\u4e00-\u9fa5]/);
    expect(result).toMatch(/部|中心$/);
  });

  it("DEPARTMENT en returns English department", () => {
    const result = generateFakeValue("DEPARTMENT", "", "en");
    expect(result.length).toBeGreaterThan(2);
  });

  it("BIZ_LICENSE returns 15-digit number", () => {
    const result = generateFakeValue("BIZ_LICENSE", "", "zh-CN");
    expect(result).toMatch(/^\d{15}$/);
  });

  it("ORG_CODE returns XXXXXXXX-X format", () => {
    const result = generateFakeValue("ORG_CODE", "", "zh-CN");
    expect(result).toMatch(/^[A-Z0-9]{8}-[A-Z0-9]$/);
  });

  it("PAYMENT zh-CN returns 支付宝/微信 format", () => {
    const result = generateFakeValue("PAYMENT", "", "zh-CN");
    expect(result).toMatch(/^(支付宝|微信):fakeuser\d+$/);
  });

  it("PAYMENT en returns Venmo/PayPal/CashApp format", () => {
    const result = generateFakeValue("PAYMENT", "", "en");
    expect(result).toMatch(/^(Venmo|PayPal|CashApp):@fakeuser\d+$/);
  });

  it("BIRTHDAY returns YYYY-MM-DD format", () => {
    const result = generateFakeValue("BIRTHDAY", "", "en");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const year = parseInt(result.split("-")[0]);
    expect(year).toBeGreaterThanOrEqual(1960);
    expect(year).toBeLessThanOrEqual(2005);
  });

  it("DOB maps to birthday generator", () => {
    const result = generateFakeValue("DOB", "", "en");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("DATE returns YYYY-MM-DD format", () => {
    const result = generateFakeValue("DATE", "", "en");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const year = parseInt(result.split("-")[0]);
    expect(year).toBeGreaterThanOrEqual(2020);
    expect(year).toBeLessThanOrEqual(2026);
  });

  it("TIME returns HH:MM format", () => {
    const result = generateFakeValue("TIME", "", "en");
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("SALARY zh-CN returns 元/月 format", () => {
    const result = generateFakeValue("SALARY", "", "zh-CN");
    expect(result).toMatch(/^\d+元\/月$/);
  });

  it("SALARY en returns $/yr format", () => {
    const result = generateFakeValue("SALARY", "", "en");
    expect(result).toMatch(/^\$[\d,]+\/yr$/);
  });

  it("AMOUNT zh-CN returns 元 format", () => {
    const result = generateFakeValue("AMOUNT", "", "zh-CN");
    expect(result).toMatch(/^\d+\.\d{2}元$/);
  });

  it("AMOUNT en returns $ format", () => {
    const result = generateFakeValue("AMOUNT", "", "en");
    expect(result).toMatch(/^\$\d+\.\d{2}$/);
  });

  it("DELIVERY returns courier prefix + 12 digits", () => {
    const result = generateFakeValue("DELIVERY", "", "en");
    expect(result).toMatch(/^(SF|YT|ZTO|STO|YD|JD|EMS|BEST)\d{12}$/);
  });

  it("TRACKING_NUMBER maps to delivery generator", () => {
    const result = generateFakeValue("TRACKING_NUMBER", "", "en");
    expect(result).toMatch(/^(SF|YT|ZTO|STO|YD|JD|EMS|BEST)\d{12}$/);
  });

  it("ACCESS_CODE returns digits + #", () => {
    const result = generateFakeValue("ACCESS_CODE", "", "en");
    expect(result).toMatch(/^\d{4,6}#$/);
  });

  it("GATE_CODE and PIN map to access code generator", () => {
    const r1 = generateFakeValue("GATE_CODE", "", "en");
    const r2 = generateFakeValue("PIN", "", "en");
    expect(r1).toMatch(/^\d{4,6}#$/);
    expect(r2).toMatch(/^\d{4,6}#$/);
  });

  it("PASSPORT zh-CN returns E/G + 8 digits", () => {
    const result = generateFakeValue("PASSPORT", "", "zh-CN");
    expect(result).toMatch(/^[EG]\d{8}$/);
  });

  it("PASSPORT en returns letter + 8 digits", () => {
    const result = generateFakeValue("PASSPORT", "", "en");
    expect(result).toMatch(/^[A-Z0-9]\d{8}$/);
  });

  it("DRIVER_LICENSE zh-CN returns 18-digit number", () => {
    const result = generateFakeValue("DRIVER_LICENSE", "", "zh-CN");
    expect(result).toMatch(/^\d{18}$/);
  });

  it("DRIVER_LICENSE en returns letter + 7 digits", () => {
    const result = generateFakeValue("DRIVER_LICENSE", "", "en");
    expect(result).toMatch(/^[A-Z0-9]\d{7}$/);
  });

  it("SSN returns xxx-xx-xxxx format", () => {
    const result = generateFakeValue("SSN", "", "en");
    expect(result).toMatch(/^\d{3}-\d{2}-\d{4}$/);
  });

  it("NOTE returns non-empty string", () => {
    const result = generateFakeValue("NOTE", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("ORDER returns prefix + 12 digits", () => {
    const result = generateFakeValue("ORDER", "", "en");
    expect(result).toMatch(/^(ORD|DD|SO|PO)\d{12}$/);
  });

  it("ORDER_NUMBER and ORDER_ID map to order generator", () => {
    const r1 = generateFakeValue("ORDER_NUMBER", "", "en");
    const r2 = generateFakeValue("ORDER_ID", "", "en");
    expect(r1).toMatch(/^(ORD|DD|SO|PO)\d{12}$/);
    expect(r2).toMatch(/^(ORD|DD|SO|PO)\d{12}$/);
  });

  it("CONTRACT returns prefix-year-digits format", () => {
    const result = generateFakeValue("CONTRACT", "", "zh-CN");
    expect(result).toMatch(/^(HT|CT|BH)-\d{4}-\d{6}$/);
  });

  it("INVOICE zh-CN returns 10-digit code", () => {
    const result = generateFakeValue("INVOICE", "", "zh-CN");
    expect(result).toMatch(/^(01|04|10|11)\d{8}$/);
  });

  it("INVOICE en returns INV-xxxx-xxxxxx format", () => {
    const result = generateFakeValue("INVOICE", "", "en");
    expect(result).toMatch(/^INV-\d{4}-\d{6}$/);
  });

  it("CUSTOMER_ID returns prefix + 8 digits", () => {
    const result = generateFakeValue("CUSTOMER_ID", "", "en");
    expect(result).toMatch(/^(CUS|CLI|KH)\d{8}$/);
  });

  it("TRANSACTION returns TXN + 16 hex chars", () => {
    const result = generateFakeValue("TRANSACTION", "", "en");
    expect(result).toMatch(/^TXN[0-9a-f]{16}$/);
  });

  it("RECEIPT returns RCP-xxxx-xxxxxxxx format", () => {
    const result = generateFakeValue("RECEIPT", "", "en");
    expect(result).toMatch(/^RCP-\d{4}-\d{8}$/);
  });

  it("SKU returns XXX-XXXX-0000 format", () => {
    const result = generateFakeValue("SKU", "", "en");
    expect(result).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{4}-\d{4}$/);
  });

  it("PRODUCT zh-CN returns Chinese product name", () => {
    const result = generateFakeValue("PRODUCT", "", "zh-CN");
    expect(result).toMatch(/[\u4e00-\u9fa5]/);
  });

  it("PRODUCT en returns English product name", () => {
    const result = generateFakeValue("PRODUCT", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("PROJECT returns prefix-year-digits format", () => {
    const result = generateFakeValue("PROJECT", "", "en");
    expect(result).toMatch(/^(PRJ|XM|WBS)-\d{4}-\d{4}$/);
  });

  it("EMPLOYEE_ID returns prefix + 6 digits", () => {
    const result = generateFakeValue("EMPLOYEE_ID", "", "en");
    expect(result).toMatch(/^(EMP|GH|STF)\d{6}$/);
  });

  it("ITEM_CODE maps to SKU generator", () => {
    const result = generateFakeValue("ITEM_CODE", "", "en");
    expect(result).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{4}-\d{4}$/);
  });

  it("CLIENT_ID maps to customer ID generator", () => {
    const result = generateFakeValue("CLIENT_ID", "", "en");
    expect(result).toMatch(/^(CUS|CLI|KH)\d{8}$/);
  });

  it("ETHNICITY zh-CN returns Chinese ethnic group", () => {
    const result = generateFakeValue("ETHNICITY", "", "zh-CN");
    expect(result).toMatch(/族|信仰/);
  });

  it("ETHNICITY en returns English ethnicity", () => {
    const result = generateFakeValue("ETHNICITY", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("RACE maps to ethnicity generator", () => {
    const result = generateFakeValue("RACE", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("RELIGION zh-CN returns Chinese religion", () => {
    const result = generateFakeValue("RELIGION", "", "zh-CN");
    expect(result).toMatch(/[\u4e00-\u9fa5]/);
  });

  it("RELIGION en returns English religion", () => {
    const result = generateFakeValue("RELIGION", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("POLITICAL_OPINION returns political affiliation", () => {
    const result = generateFakeValue("POLITICAL_OPINION", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("UNION_MEMBERSHIP returns union info", () => {
    const result = generateFakeValue("UNION_MEMBERSHIP", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("HEALTH returns health condition", () => {
    const result = generateFakeValue("HEALTH", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("DIAGNOSIS maps to health generator", () => {
    const result = generateFakeValue("DIAGNOSIS", "", "zh-CN");
    expect(result).toMatch(/[\u4e00-\u9fa5]/);
  });

  it("MEDICATION returns medication name", () => {
    const result = generateFakeValue("MEDICATION", "", "en");
    expect(result).toMatch(/\d+mg/);
  });

  it("BIOMETRIC returns BIO-hex format", () => {
    const result = generateFakeValue("BIOMETRIC", "", "en");
    expect(result).toMatch(/^BIO-[0-9a-f]{8}-[0-9a-f]{4}$/);
  });

  it("FINGERPRINT and FACE_ID map to biometric generator", () => {
    expect(generateFakeValue("FINGERPRINT", "", "en")).toMatch(/^BIO-/);
    expect(generateFakeValue("FACE_ID", "", "en")).toMatch(/^BIO-/);
  });

  it("GENETIC returns gene:variant format", () => {
    const result = generateFakeValue("GENETIC", "", "en");
    expect(result).toMatch(/^[A-Z0-9-]+:.+$/);
  });

  it("DNA maps to genetic generator", () => {
    const result = generateFakeValue("DNA", "", "en");
    expect(result).toMatch(/:/);
  });

  it("SEXUAL_ORIENTATION returns orientation string", () => {
    const result = generateFakeValue("SEXUAL_ORIENTATION", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("CRIMINAL_RECORD returns record description", () => {
    const result = generateFakeValue("CRIMINAL_RECORD", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("GENDER returns gender string", () => {
    const result = generateFakeValue("GENDER", "", "en");
    expect(["Male", "Female", "Non-binary", "Prefer not to say"]).toContain(result);
  });

  it("AGE returns number between 18 and 85", () => {
    const result = generateFakeValue("AGE", "", "en");
    const age = parseInt(result);
    expect(age).toBeGreaterThanOrEqual(18);
    expect(age).toBeLessThanOrEqual(85);
  });

  it("BIRTH_PLACE returns place string", () => {
    const result = generateFakeValue("BIRTH_PLACE", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("NATIONALITY returns nationality/citizenship", () => {
    const result = generateFakeValue("NATIONALITY", "", "en");
    expect(result.length).toBeGreaterThan(3);
  });

  it("MEDICAL_RECORD_NUMBER returns MRN-xxxx-xxxxxxxx format", () => {
    const result = generateFakeValue("MEDICAL_RECORD_NUMBER", "", "en");
    expect(result).toMatch(/^MRN-\d{4}-\d{8}$/);
  });

  it("PATIENT_ID maps to MRN generator", () => {
    const result = generateFakeValue("PATIENT_ID", "", "en");
    expect(result).toMatch(/^MRN-/);
  });

  it("HEALTH_PLAN_ID returns prefix + 10 digits", () => {
    const result = generateFakeValue("HEALTH_PLAN_ID", "", "en");
    expect(result).toMatch(/^(HP|BCBS|UHC|AETNA)-\d{10}$/);
  });

  it("INSURANCE_NUMBER returns INS-XXXX-xxxxxxxx format", () => {
    const result = generateFakeValue("INSURANCE_NUMBER", "", "en");
    expect(result).toMatch(/^INS-[A-Z0-9]{4}-\d{8}$/);
  });

  it("DEVICE_ID returns UUID-like format", () => {
    const result = generateFakeValue("DEVICE_ID", "", "en");
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("IMEI and MAC_ADDRESS map to device ID generator", () => {
    expect(generateFakeValue("IMEI", "", "en")).toMatch(/^[0-9a-f]{8}-/);
    expect(generateFakeValue("MAC_ADDRESS", "", "en")).toMatch(/^[0-9a-f]{8}-/);
  });

  it("GEO_COORDINATES returns lat,lon format", () => {
    const result = generateFakeValue("GEO_COORDINATES", "", "en");
    const parts = result.split(",");
    expect(parts).toHaveLength(2);
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    expect(lat).toBeGreaterThanOrEqual(-90);
    expect(lat).toBeLessThanOrEqual(90);
    expect(lon).toBeGreaterThanOrEqual(-180);
    expect(lon).toBeLessThanOrEqual(180);
  });

  it("GPS and LOCATION map to geo coordinates", () => {
    expect(generateFakeValue("GPS", "", "en")).toMatch(/,/);
    expect(generateFakeValue("LOCATION", "", "en")).toMatch(/,/);
  });

  it("COOKIE_ID returns _ga_ prefixed string", () => {
    const result = generateFakeValue("COOKIE_ID", "", "en");
    expect(result).toMatch(/^_ga_[A-Za-z0-9]{10}$/);
  });

  it("STUDENT_ID returns STU + 8 digits", () => {
    const result = generateFakeValue("STUDENT_ID", "", "en");
    expect(result).toMatch(/^STU\d{8}$/);
  });

  it("CREDIT_SCORE returns number between 300-850", () => {
    const result = generateFakeValue("CREDIT_SCORE", "", "en");
    const score = parseInt(result);
    expect(score).toBeGreaterThanOrEqual(300);
    expect(score).toBeLessThanOrEqual(850);
  });

  it("LOAN_NUMBER returns LN-xxxx-xxxxxxxx format", () => {
    const result = generateFakeValue("LOAN_NUMBER", "", "en");
    expect(result).toMatch(/^LN-\d{4}-\d{8}$/);
  });

  it("FAX returns phone-like format", () => {
    const result = generateFakeValue("FAX", "", "en");
    expect(result).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/);
  });

  it("FAX zh-CN returns area code + 8 digits", () => {
    const result = generateFakeValue("FAX", "", "zh-CN");
    expect(result).toMatch(/^0\d{2,3}-\d{8}$/);
  });

  it("USERNAME returns adjective_noun_digits format", () => {
    const result = generateFakeValue("USERNAME", "", "en");
    expect(result).toMatch(/^[a-z]+_[a-z]+_\d{4}$/);
  });

  it("ACCOUNT_NAME and HANDLE map to username generator", () => {
    expect(generateFakeValue("ACCOUNT_NAME", "", "en")).toMatch(/_/);
    expect(generateFakeValue("HANDLE", "", "en")).toMatch(/_/);
  });

  it("SIGNATURE returns bracketed signature format", () => {
    const result = generateFakeValue("SIGNATURE", "", "en");
    expect(result).toMatch(/^\[Signature:/);
  });

  it("SIGNATURE zh-CN returns Chinese signature format", () => {
    const result = generateFakeValue("SIGNATURE", "", "zh-CN");
    expect(result).toMatch(/^\[签名:/);
  });

  it("BROWSING_HISTORY returns URL or search keyword", () => {
    const result = generateFakeValue("BROWSING_HISTORY", "", "en");
    expect(result.length).toBeGreaterThan(0);
  });

  it("BROWSING_HISTORY zh-CN returns Chinese content", () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(generateFakeValue("BROWSING_HISTORY", "", "zh-CN"));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it("SEARCH_HISTORY and SEARCH_QUERY map to browsing history generator", () => {
    const r1 = generateFakeValue("SEARCH_HISTORY", "", "en");
    const r2 = generateFakeValue("SEARCH_QUERY", "", "en");
    expect(r1.length).toBeGreaterThan(0);
    expect(r2.length).toBeGreaterThan(0);
  });

  it("BROWSING_DATA and WEB_HISTORY map to browsing history generator", () => {
    const r1 = generateFakeValue("BROWSING_DATA", "", "en");
    const r2 = generateFakeValue("WEB_HISTORY", "", "en");
    expect(r1.length).toBeGreaterThan(0);
    expect(r2.length).toBeGreaterThan(0);
  });

  it("MESSAGE_CONTENT returns a plausible message string", () => {
    const result = generateFakeValue("MESSAGE_CONTENT", "", "en");
    expect(result.length).toBeGreaterThan(10);
    expect(result).toMatch(/[A-Za-z]/);
  });

  it("MESSAGE_CONTENT zh-CN returns Chinese message", () => {
    const result = generateFakeValue("MESSAGE_CONTENT", "", "zh-CN");
    expect(result).toMatch(/[\u4e00-\u9fa5]/);
  });

  it("COMMUNICATION and SMS_CONTENT map to message content generator", () => {
    const r1 = generateFakeValue("COMMUNICATION", "", "en");
    const r2 = generateFakeValue("SMS_CONTENT", "", "en");
    expect(r1.length).toBeGreaterThan(10);
    expect(r2.length).toBeGreaterThan(10);
  });

  it("EMAIL_CONTENT and CHAT_MESSAGE and MAIL_BODY map to message content generator", () => {
    const r1 = generateFakeValue("EMAIL_CONTENT", "", "en");
    const r2 = generateFakeValue("CHAT_MESSAGE", "", "zh-CN");
    const r3 = generateFakeValue("MAIL_BODY", "", "en");
    expect(r1.length).toBeGreaterThan(10);
    expect(r2.length).toBeGreaterThan(5);
    expect(r3.length).toBeGreaterThan(10);
  });
});

describe("generateFakeEmail", () => {
  it("returns fakeuser format", () => {
    const result = generateFakeEmail("user@corp.com");
    expect(result).toMatch(/^fakeuser\d+@example\.com$/);
  });
});

describe("generateFakePhone", () => {
  it("zh-CN phone is 11 digits", () => {
    const result = generateFakePhone("13900001111", "zh-CN");
    expect(result).toMatch(/^1[3-9]\d{9}$/);
  });

  it("en phone is +1 format", () => {
    const result = generateFakePhone("+1-555-000-1234", "en");
    expect(result).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/);
  });
});
