/*
Copyright 2024 Dexrn ZacAttack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { readdir, readFile, writeFile, stat } from "fs/promises";
import { join, resolve, relative } from "path";

const path: string = resolve(process.argv[2]!);

const lEndian = false; 

/**
 * Stores the info for each chunk indice.
 */
interface indice {
    offset: number;
    length: number;
}

/**
 * Stores the timestamps for each chunk
 */
interface timestamp {
    timestamp: number;
}

/**
 * Stores the compressed regions.
 */
interface cRegion {
    compressedRegion: Uint8Array;
}

let timestamps: timestamp[] = [];
let indices: indice[] = [];
let compressedRegions: cRegion[] = [];

function getUint24(byteOffset: number, dataView: DataView, lEndian: boolean = true): number {
    const byte1 = dataView.getUint8(byteOffset);
    const byte2 = dataView.getUint8(byteOffset + 1);
    const byte3 = dataView.getUint8(byteOffset + 2);

    let result = lEndian ? (byte3 << 16) | (byte2 << 8) | byte1 : (byte1 << 16) | (byte2 << 8) | byte3;

    return result;
}

async function read() {
    parseRegion(await readFile(path));
}

async function parseRegion(file: Buffer) {
    const fileDV = new DataView(file.buffer);
    let curOffset = 0;
    
    while (curOffset < 4095) {
        var cIOffset = getUint24(curOffset, fileDV, lEndian) * 4096;
        curOffset += 3;
        var cILength = fileDV.getUint8(curOffset) * 4096;
        curOffset += 1;
        indices.push({offset: cIOffset, length: cILength});
    }
    while (curOffset < 8191) {
        var iTimestamp = fileDV.getUint32(curOffset, lEndian);
        curOffset += 4;
        timestamps.push({timestamp: iTimestamp});
    }
}

read();