/// <reference path="../../built/pxtcompiler.d.ts"/>

import "mocha";
import * as chai from "chai";

import * as util from "../common/testUtils";

const assert = chai.assert;

function initGlobals() {
    let g = global as any
    g.pxt = pxt;
    g.ts = ts;
    g.pxtc = pxtc;
    g.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
    g.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}

initGlobals();

// Just needs to exist
pxt.setAppTarget(util.testAppTarget);

// These tests cover the embedded-source format documented in
// docs/source-embedding.md: a 16-byte header (8-byte magic, 16-bit JSON
// header length at offset 8, 32-bit text length at offset 10, reserved
// zeroes at offset 14) followed by the JSON header and the LZMA-compressed
// project text, emitted as type-0x0E records at the end of a .hex file.

// the hex emitter masks each char code with 0xff when writing records
// (see patchHex in pxtcompiler/emitter/hexfile.ts), so read headers the same way
function headerByte(packed: string, i: number) {
    return packed.charCodeAt(i) & 0xff
}

function readMetaLen(packed: string) {
    return headerByte(packed, 8) | (headerByte(packed, 9) << 8)
}

function readTextLen(packed: string) {
    return headerByte(packed, 10) | (headerByte(packed, 11) << 8) |
        (headerByte(packed, 12) << 16) | (headerByte(packed, 13) << 24)
}

// deterministic pseudo-random printable text (xorshift32); high-entropy so
// LZMA cannot compress it much, letting tests control the compressed size
function pseudoRandomString(len: number): string {
    let seed = 0xC0FFEE
    const chars: string[] = []
    for (let i = 0; i < len; ++i) {
        seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; seed |= 0
        chars.push(String.fromCharCode(0x20 + ((seed >>> 8) % 0x5f)))
    }
    return chars.join("")
}

// mirrors the type-0x0E record emission for bin.packedSource in patchHex
// (pxtcompiler/emitter/hexfile.ts)
function embedRecords(packedSource: string): string {
    const myhex: string[] = []
    let addr = 0
    for (let i = 0; i < packedSource.length; i += 16) {
        const bytes = [0x10, (addr >> 8) & 0xff, addr & 0xff, 0x0E]
        for (let j = 0; j < 16; ++j)
            bytes.push((packedSource.charCodeAt(i + j) || 0) & 0xff)
        myhex.push(ts.pxtc.hexfile.hexBytes(bytes))
        addr += 16
    }
    myhex.push(":00000001FF")
    return myhex.join("\n")
}

// compress + pack + emit records + unpack, the way download/import do
async function roundTripAsync(sourceTextLen: number) {
    const innerHeader = JSON.stringify({ name: "source embed test" })
    const source = JSON.stringify({ "main.ts": pseudoRandomString(sourceTextLen) })
    const compressed = await pxt.lzmaCompressAsync(innerHeader + source)
    const meta = JSON.stringify({
        compression: "LZMA",
        headerSize: innerHeader.length,
        editor: "tsprj"
    })
    const packed = ts.pxtc.packSource(meta, pxt.Util.uint8ArrayToString(compressed))
    const hex = embedRecords(packed)
    const unpacked = await pxt.cpp.unpackSourceFromHexAsync(pxt.Util.stringToUint8Array(hex))
    return { compressedLen: compressed.length, source, unpacked }
}

describe("embedded source header", () => {
    const meta = JSON.stringify({ compression: "LZMA", headerSize: 10 })

    it("encodes text lengths below 64 KiB", () => {
        for (const len of [0, 1, 9152, 0xfffe, 0xffff]) {
            const packed = ts.pxtc.packSource(meta, pseudoRandomString(len))
            assert.strictEqual(readMetaLen(packed), meta.length, `metaLen for text length ${len}`)
            assert.strictEqual(readTextLen(packed), len, `textLen for text length ${len}`)
        }
    })

    it("encodes text lengths of 64 KiB and above", () => {
        // 74688 is the compressed source size of the CreateAI project in
        // microsoft/pxt-microbit#<issue>; a 16-bit header records it as
        // 74688 % 65536 == 9152, making the hex impossible to re-import
        for (const len of [0x10000, 0x10001, 74688, 0x123456]) {
            const packed = ts.pxtc.packSource(meta, pseudoRandomString(len))
            assert.strictEqual(readTextLen(packed), len, `textLen for text length ${len}`)
        }
    })

    it("keeps the reserved bytes at offset 14 zero", () => {
        for (const len of [100, 0xffff, 74688]) {
            const packed = ts.pxtc.packSource(meta, pseudoRandomString(len))
            assert.strictEqual(headerByte(packed, 14), 0, `reserved byte 14 for text length ${len}`)
            assert.strictEqual(headerByte(packed, 15), 0, `reserved byte 15 for text length ${len}`)
        }
    })
})

describe("embedded source .hex round-trip", function () {
    this.timeout(60000)

    // avoid strictEqual on the full sources: a mismatch would print the
    // entire pseudo-random project as a diff
    function assertRecovered(r: { compressedLen: number; source: string; unpacked: pxt.cpp.HexFile }) {
        assert.isOk(r.unpacked, "import recovered nothing")
        assert.isString(r.unpacked.source, "no source recovered")
        assert.strictEqual(r.unpacked.source.length, r.source.length, "recovered source length differs")
        assert.isTrue(r.unpacked.source === r.source, "recovered source content differs from original")
    }

    it("re-imports a project whose compressed source is below 64 KiB", async () => {
        const r = await roundTripAsync(30000)
        assert.isBelow(r.compressedLen, 0x10000, "test precondition: compressed source below 64 KiB")
        assertRecovered(r)
    })

    it("re-imports a project whose compressed source exceeds 64 KiB", async () => {
        const r = await roundTripAsync(120000)
        assert.isAbove(r.compressedLen, 0x10000, "test precondition: compressed source above 64 KiB")
        assertRecovered(r)
    })
})
