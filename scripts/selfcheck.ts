// Checagem rápida da lógica crítica sem banco: npx tsx scripts/selfcheck.ts
import assert from "node:assert/strict";
import { isValidCpf } from "../src/lib/cpf";
import { hashPassword, verifyPassword } from "../src/lib/password";

assert.equal(isValidCpf("529.982.247-25"), true);
assert.equal(isValidCpf("52998224725"), true);
assert.equal(isValidCpf("52998224724"), false, "dígito errado");
assert.equal(isValidCpf("111.111.111-11"), false, "repetido");
assert.equal(isValidCpf("123"), false, "curto");

const h = hashPassword("segredo-123");
assert.equal(verifyPassword("segredo-123", h), true);
assert.equal(verifyPassword("errado", h), false);

console.log("selfcheck ok");
