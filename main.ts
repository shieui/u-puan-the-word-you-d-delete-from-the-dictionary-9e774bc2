// The Word You'd Delete From the Dictionary: the one word to erase forever.
// Pure Node.js standard library only; no network, no child processes.
// Deterministic: the same word is written on every run.
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORD = "kerfuffle";
const outDir = "/output";
const outPath = join(outDir, "entry.txt");

// Validate the word before writing anything.
const charCount = [...WORD].length;
if (charCount < 1 || charCount > 77) {
  console.error(`WORD must be 1-77 characters (got ${charCount}).`);
  process.exit(1);
}
if (/\s/.test(WORD)) {
  console.error("WORD must be exactly one word (no whitespace).");
  process.exit(1);
}
if (/[\u0000-\u001f\u007f]/.test(WORD)) {
  console.error("WORD must be plain printable text (no control characters).");
  process.exit(1);
}
if (!/^[a-z]+$/.test(WORD)) {
  console.error("WORD must be exactly one word of lowercase letters (a-z) only.");
  process.exit(1);
}
if (WORD !== WORD.trim()) {
  console.error("WORD must not have leading or trailing whitespace.");
  process.exit(1);
}
if (WORD.trim().length === 0) {
  console.error("WORD must not be only whitespace.");
  process.exit(1);
}
// The word must survive a UTF-8 encode/decode round trip unchanged, so the
// file the grader reads is exactly the word validated here.
if (Buffer.from(WORD, "utf8").toString("utf8") !== WORD) {
  console.error("WORD must round-trip through UTF-8 unchanged.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, WORD, "utf8");

// Read back and verify the written file matches exactly, byte for byte.
const written = readFileSync(outPath, "utf8");
if (written !== WORD) {
  console.error("Verification failed: written file does not match WORD.");
  process.exit(1);
}
const writtenBytes = readFileSync(outPath);
const expectedBytes = Buffer.from(WORD, "utf8");
if (writtenBytes.length !== expectedBytes.length) {
  console.error("Verification failed: written file byte length differs.");
  process.exit(1);
}
if (Buffer.compare(writtenBytes, expectedBytes) !== 0) {
  console.error("Verification failed: written file bytes differ from WORD.");
  process.exit(1);
}
if (writtenBytes.length === 0 || writtenBytes[writtenBytes.length - 1] === 0x0a) {
  console.error("Verification failed: written file must not end with a newline.");
  process.exit(1);
}
// The written file must be a regular file on disk whose size is exactly the
// word's byte length, and it must not start with a UTF-8 byte-order mark.
const writtenStat = statSync(outPath);
if (!writtenStat.isFile()) {
  console.error("Verification failed: /output/entry.txt is not a regular file.");
  process.exit(1);
}
if (writtenStat.size !== expectedBytes.length) {
  console.error("Verification failed: written file size differs from WORD.");
  process.exit(1);
}
if (
  writtenBytes.length >= 3 &&
  writtenBytes[0] === 0xef &&
  writtenBytes[1] === 0xbb &&
  writtenBytes[2] === 0xbf
) {
  console.error("Verification failed: written file starts with a byte-order mark.");
  process.exit(1);
}
console.log(
  `Wrote ${charCount} characters (${expectedBytes.length} bytes) to /output/entry.txt`,
);
